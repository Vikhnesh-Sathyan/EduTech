import os
import re
import io
import json
import numpy as np
import PyPDF2
import spacy
import pytesseract
from PIL import Image
from fpdf import FPDF
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from transformers import pipeline
from langdetect import detect
from googletrans import Translator
from gtts import gTTS
from collections import Counter
import speech_recognition as sr
from werkzeug.utils import secure_filename
from textblob import TextBlob
from sklearn.feature_extraction.text import TfidfVectorizer  # Import TfidfVectorizer
import ssl
import time  # Import time
import sys  # Import sys
import requests
from youtube_transcript_api import YouTubeTranscriptApi

# Disable SSL verification for NLTK downloads
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

# Initialize Flask app
app = Flask(__name__, static_folder="static")
CORS(app)

# Load NLP models
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
sentiment_analyzer = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")
nlp = spacy.load("en_core_web_sm")
translator = Translator()
recognizer = sr.Recognizer()

# Ensure static folder exists
if not os.path.exists("static"):
    os.makedirs("static")

# Function to detect and translate text to English
def translate_to_english(text):
    detected_lang = detect(text)
    if detected_lang != 'en':
        return translator.translate(text, src=detected_lang, dest='en').text
    return text

# Function to get word definition using an external API
def get_word_definition(word):
    # Replace with your actual API endpoint and key
    api_url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}"
    
    try:
        response = requests.get(api_url)
        response.raise_for_status()  # Raise an error for bad responses
        data = response.json()
        
        # Extract the definition from the response
        if isinstance(data, list) and len(data) > 0:
            meanings = data[0].get('meanings', [])
            if meanings:
                definitions = []
                for meaning in meanings:
                    for definition in meaning.get('definitions', []):
                        definitions.append(definition.get('definition'))
                return ", ".join(definitions) if definitions else "Definition not available."
    
    except Exception as e:
        print(f"Error fetching definition for {word}: {str(e)}")
    
    return "Definition not available."

# Function to extract keywords using SpaCy
def extract_keywords(text):
    doc = nlp(text)
    keywords = []
    seen = set()

    for token in doc:
        if token.pos_ in ['NOUN', 'PROPN', 'VERB', 'ADJ'] and token.is_alpha and not token.is_stop:
            if token.text.lower() not in seen:
                keywords.append(token.text)
                seen.add(token.text.lower())

    # Get definitions for keywords
    keyword_defs = []
    for word in keywords:
        definition = get_word_definition(word)
        if definition:
            keyword_defs.append({"word": word, "definition": definition})

    return keyword_defs[:10]  # Limit to top 10 keywords

# Function for Named Entity Recognition (NER)
def named_entity_recognition(text):
    doc = nlp(text)
    return {ent.text: ent.label_ for ent in doc.ents}

# Function for text complexity analysis
def text_complexity(text):
    doc = nlp(text)
    word_count = len([token for token in doc if token.is_alpha])
    sentence_count = len(list(doc.sents))
    avg_sentence_length = word_count / sentence_count if sentence_count else word_count
    return {"word_count": word_count, "sentence_count": sentence_count, "avg_sentence_length": avg_sentence_length}

# Function to get most common words
def word_frequency(text, top_n=10):
    words = re.findall(r'\w+', text.lower())
    return dict(Counter(words).most_common(top_n))

# Function to summarize text with timestamps
def summarize_text_with_timestamps(text, timestamps):
    try:
        print(f"Input text length: {len(text)} characters")
        text = translate_to_english(text)
        print(f"Text after translation: {len(text)} characters")
        words = text.split()
        print(f"Number of words: {len(words)}")

        if len(words) < 50:
            print("Text too short for summarization")
            return "Text is too short for summarization. Please provide at least 50 words."

        input_length = len(words)
        max_length = max(100, min(int(input_length * 0.4), 500))
        min_length = max(50, min(int(max_length * 0.7), 300))
        print(f"Using max_length={max_length}, min_length={min_length}")

        if input_length <= 1024:
            print("Processing text as single chunk")
            summary = summarizer(text, 
                               max_length=max_length,
                               min_length=min_length,
                               do_sample=False,
                               num_beams=4,
                               length_penalty=2.0,
                               early_stopping=True)
            summary_with_timestamps = []
            for i, point in enumerate(summary[0]['summary_text'].split()):
                timestamp = timestamps[i] if i < len(timestamps) else ""
                summary_with_timestamps.append(f"{timestamp}: {point}")
            return "\n".join(summary_with_timestamps)

        print("Processing text in chunks")
        chunk_size = 512
        overlap = 100
        summaries = []

        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            print(f"Processing chunk {i//(chunk_size-overlap) + 1} with length {len(chunk.split())}")
            
            chunk_max_length = max(50, min(int(len(chunk.split()) * 0.4), 250))
            chunk_min_length = max(30, min(int(chunk_max_length * 0.7), 150))
            
            summary_chunk = summarizer(chunk,
                                    max_length=chunk_max_length,
                                    min_length=chunk_min_length,
                                    do_sample=False,
                                    num_beams=4,
                                    length_penalty=2.0,
                                    early_stopping=True)
            summaries.append(summary_chunk[0]['summary_text'])

        intermediate_summary = " ".join(summaries)
        if len(intermediate_summary.split()) > max_length:
            final_summary = summarizer(intermediate_summary,
                                    max_length=max_length,
                                    min_length=min_length,
                                    do_sample=False,
                                    num_beams=4,
                                    length_penalty=2.0,
                                    early_stopping=True)[0]['summary_text']
        else:
            final_summary = intermediate_summary

        print(f"Final summary length: {len(final_summary.split())} words")
        summary_with_timestamps = []
        for i, point in enumerate(final_summary.split()):
            timestamp = timestamps[i] if i < len(timestamps) else ""
            summary_with_timestamps.append(f"{timestamp}: {point}")
        return "\n".join(summary_with_timestamps)

    except Exception as e:
        print(f"Error in summarize_text: {str(e)}")
        raise Exception(f"Failed to summarize text: {str(e)}")

def analyze_sentiment_detailed(text):
    blob = TextBlob(text)
    sentiment_score = blob.sentiment.polarity
    
    if sentiment_score > 0.3:
        return "Very Positive"
    elif sentiment_score > 0:
        return "Slightly Positive"
    elif sentiment_score < -0.3:
        return "Very Negative"
    elif sentiment_score < 0:
        return "Slightly Negative"
    else:
        return "Neutral"

def analyze_readability(text):
    sentences = list(nlp(text).sents)  # Use SpaCy for sentence tokenization
    words = text.split()
    
    avg_word_length = sum(len(word) for word in words) / len(words)
    avg_sentence_length = len(words) / len(sentences)
    
    flesch_score = 206.835 - 1.015 * avg_sentence_length - 84.6 * avg_word_length
    
    if flesch_score > 90:
        difficulty = "Very Easy"
    elif flesch_score > 80:
        difficulty = "Easy"
    elif flesch_score > 70:
        difficulty = "Fairly Easy"
    elif flesch_score > 60:
        difficulty = "Standard"
    elif flesch_score > 50:
        difficulty = "Fairly Difficult"
    else:
        difficulty = "Difficult"
    
    return {
        "score": round(flesch_score, 2),
        "difficulty": difficulty,
        "avg_word_length": round(avg_word_length, 2),
        "avg_sentence_length": round(avg_sentence_length, 2)
    }

def extract_key_phrases(text):
    sentences = list(nlp(text).sents)  # Use SpaCy for sentence tokenization
    vectorizer = TfidfVectorizer(ngram_range=(1, 3), stop_words='english')
    tfidf_matrix = vectorizer.fit_transform([text])
    
    feature_names = vectorizer.get_feature_names_out()
    scores = zip(feature_names, tfidf_matrix.toarray()[0])
    sorted_scores = sorted(scores, key=lambda x: x[1], reverse=True)
    
    return [phrase for phrase, score in sorted_scores[:5]]

def extract_important_sentences(text, num_sentences=3):
    try:
        sentences = list(nlp(text).sents)  # Use SpaCy for sentence tokenization
        if len(sentences) <= num_sentences:
            return sentences
        
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform([sent.text for sent in sentences])
        
        sentence_scores = []
        for i, sentence in enumerate(sentences):
            score = np.sum(tfidf_matrix[i].toarray())
            sentence_scores.append((score, sentence.text))
        
        sentence_scores.sort(reverse=True)
        return [sentence for _, sentence in sentence_scores[:num_sentences]]
    except Exception as e:
        print(f"Error extracting important sentences: {str(e)}")
        return []

def highlight_important_terms(text, keywords):
    highlighted_text = text
    for keyword in keywords:
        if isinstance(keyword, dict) and 'word' in keyword:
            word = keyword['word']
            pattern = re.compile(re.escape(word), re.IGNORECASE)
            highlighted_text = pattern.sub(f"**{word}**", highlighted_text)
    return highlighted_text

# API: Summarize text
@app.route('/summarize', methods=['POST'])
def summarize():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        text = data.get("text", "").strip()
        target_language = data.get("target_language", "en")

        print(f"Received request with text length: {len(text)}")
        print(f"Target language: {target_language}")

        if not text:
            return jsonify({"error": "No text provided"}), 400

        # Translate if necessary
        if target_language != "en":
            try:
                text = translator.translate(text, dest=target_language).text
                print(f"Text translated to {target_language}")
            except Exception as e:
                print(f"Translation error: {str(e)}")
                return jsonify({"error": f"Translation failed: {str(e)}"}), 500

        # Assuming you have a way to extract timestamps from the video
        timestamps = extract_timestamps(text)  # Implement this function to extract timestamps
        
        try:
            summary = summarize_text_with_timestamps(text, timestamps)
            print(f"Summary generated: {summary}")  # Check the generated summary
        except Exception as e:
            print(f"Summarization error: {str(e)}")
            return jsonify({"error": f"Summarization failed: {str(e)}"}), 500

        # Process other analysis only if summarization was successful
        keywords = extract_keywords(text)
        entities = named_entity_recognition(text)
        complexity = text_complexity(text)
        word_freq = word_frequency(text)
        sentiment = analyze_sentiment_detailed(text)
        readability = analyze_readability(text)
        key_phrases = extract_key_phrases(text)

        response_data = {
            "summary": summary,
            "keywords": keywords,
            "entities": entities,
            "complexity": complexity,
            "word_frequency": word_freq,
            "sentiment": sentiment,
            "readability": readability,
            "key_phrases": key_phrases
        }

        print("Successfully processed all analysis")
        return jsonify(response_data), 200

    except Exception as e:
        print(f"General error in summarize endpoint: {str(e)}")
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

@app.route('/text_to_speech', methods=['POST'])
def text_to_speech():
    try:
        data = request.get_json()
        text = data.get("text", "")
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
            
        # Create a temporary file for the audio
        temp_file = "static/speech.mp3"
        tts = gTTS(text=text, lang='en')
        tts.save(temp_file)
        
        return send_file(temp_file, mimetype='audio/mp3')
        
    except Exception as e:
        return jsonify({"error": f"Error generating speech: {str(e)}"}), 500

# API: Download summarized text as a PDF
@app.route('/download_pdf', methods=['POST'])
def download_pdf():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        print("Received data for PDF generation:", data)

        # Validate required fields
        if not data.get("text"):
            return jsonify({"error": "No summary text provided"}), 400

        # Initialize variables with default values
        summary = "No summary available."
        sentiment = "N/A"  # Default value for sentiment
        keywords = []
        complexity = {}
        readability = {}
        key_phrases = []

        try:
            # Get the text for summarization
            text = str(data.get("text", "No summary provided."))
            # Generate the summary from the text
            summary = summarize_text(text)
            print(f"Summary generated: {summary}")  # Check the generated summary
            
            # Get other data
            keywords = data.get("keywords", [])
            complexity = data.get("complexity", {})
            sentiment = data.get("sentiment", "N/A")  # Ensure sentiment is set
            readability = data.get("readability", {})
            key_phrases = data.get("key_phrases", [])

            # Create static directory if it doesn't exist
            static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
            if not os.path.exists(static_dir):
                os.makedirs(static_dir, mode=0o755)

            # Verify static directory is writable
            if not os.access(static_dir, os.W_OK):
                return jsonify({"error": "Static directory is not writable"}), 500

            # Create PDF with custom styling
            pdf = FPDF(format='A4')
            pdf.add_page()
            
            # Set margins
            margin = 20
            pdf.set_margins(left=margin, top=margin, right=margin)
            pdf.set_auto_page_break(auto=True, margin=margin)
            
            effective_width = pdf.w - 2 * margin
            
            # Title
            pdf.set_text_color(0, 51, 102)  # Dark blue
            pdf.set_font("Helvetica", 'B', size=24)
            pdf.cell(effective_width, 15, "Document Analysis Report", ln=True, align="C")
            pdf.ln(10)

            # Add timestamp
            pdf.set_font("Helvetica", '', size=10)
            pdf.set_text_color(128, 128, 128)  # Gray
            timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
            pdf.cell(effective_width, 10, f"Generated on: {timestamp}", ln=True, align="R")
            pdf.ln(10)

            # Summary section
            pdf.set_text_color(0, 51, 102)
            pdf.set_font("Helvetica", 'B', size=16)
            pdf.cell(effective_width, 10, "Summary", ln=True)
            pdf.ln(5)
            
            # Add summary text
            pdf.set_font("Helvetica", '', size=11)
            pdf.multi_cell(effective_width, 6, summary)  # Ensure summary is added
            
            pdf.ln(10)

            # Key Metrics section
            pdf.set_text_color(0, 51, 102)
            pdf.set_font("Helvetica", 'B', size=16)
            pdf.cell(effective_width, 10, "Key Metrics", ln=True)
            pdf.ln(5)

            # Create a metrics table
            metrics_data = [
                ["Readability", readability.get("difficulty", "N/A")],
                ["Sentiment", sentiment],
                ["Word Count", str(complexity.get("word_count", "N/A"))],
                ["Sentence Count", str(complexity.get("sentence_count", "N/A"))]
            ]

            # Add metrics table
            pdf.set_font("Helvetica", '', size=11)
            col_width = effective_width / 2
            row_height = 8
            
            for row in metrics_data:
                pdf.set_text_color(0, 0, 0)
                pdf.set_font("Helvetica", 'B', size=11)
                pdf.cell(col_width, row_height, row[0], border=1)
                pdf.set_font("Helvetica", '', size=11)
                pdf.cell(col_width, row_height, row[1], border=1, ln=True)
            
            pdf.ln(10)

            # Important Terms section
            pdf.set_text_color(0, 51, 102)
            pdf.set_font("Helvetica", 'B', size=16)
            pdf.cell(effective_width, 10, "Important Terms", ln=True)
            pdf.ln(5)

            # Add keywords and definitions
            for keyword in keywords:
                if isinstance(keyword, dict) and 'word' in keyword and 'definition' in keyword:
                    pdf.set_text_color(0, 102, 204)  # Blue
                    pdf.set_font("Helvetica", 'B', size=12)
                    pdf.cell(effective_width, 8, f"- {keyword['word']}", ln=True)
                    
                    pdf.set_text_color(0, 0, 0)  # Black
                    pdf.set_font("Helvetica", '', size=11)
                    pdf.multi_cell(effective_width - 10, 6, keyword['definition'])
                    pdf.ln(3)

            # Key Phrases section
            if key_phrases:
                pdf.ln(5)
                pdf.set_text_color(0, 51, 102)
                pdf.set_font("Helvetica", 'B', size=16)
                pdf.cell(effective_width, 10, "Key Phrases", ln=True)
                pdf.ln(5)

                pdf.set_text_color(0, 0, 0)
                pdf.set_font("Helvetica", '', size=11)
                for phrase in key_phrases:
                    pdf.cell(effective_width, 8, f"- {phrase}", ln=True)

            # Before generating the PDF, print the data
            print("Summary:", summary)
            print("Keywords:", keywords)
            print("Complexity:", complexity)
            print("Readability:", readability)
            print("Key Phrases:", key_phrases)

            # Generate and save the PDF
            timestamp = int(time.time())
            pdf_filename = f'document_analysis_{timestamp}.pdf'
            pdf_path = os.path.join(static_dir, pdf_filename)
            
            pdf.output(pdf_path)
            print(f"PDF saved successfully at: {pdf_path}")
            
            if not os.path.exists(pdf_path):
                return jsonify({"error": "Failed to save PDF file"}), 500
                
            return send_file(
                pdf_path,
                mimetype='application/pdf',
                as_attachment=True,
                download_name=pdf_filename
            )
            
        except Exception as pdf_error:
            print(f"Error during PDF generation: {str(pdf_error)}")
            return jsonify({"error": f"PDF generation failed: {str(pdf_error)}"}), 500

    except Exception as e:
        print(f"General error in download_pdf: {str(e)}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

# Add static route to serve files
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)


@app.route('/summarize_pdf', methods=['POST'])
def summarize_pdf():
    try:
        if 'pdf' not in request.files:
            return jsonify({"error": "No PDF file provided"}), 400
            
        pdf_file = request.files['pdf']
        document_type = request.form.get('document_type', 'general')
        
        if pdf_file.filename == '':
            return jsonify({"error": "No selected file"}), 400
            
        if not pdf_file.filename.lower().endswith('.pdf'):
            return jsonify({"error": "File must be a PDF"}), 415

        # Check file size (limit to 10MB)
        if len(pdf_file.read()) > 10 * 1024 * 1024:  # 10MB in bytes
            return jsonify({"error": "File size too large. Please upload a PDF smaller than 10MB"}), 413
        
        # Reset file pointer after reading
        pdf_file.seek(0)

        try:
            # Read PDF content
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            # Check if PDF is encrypted
            if pdf_reader.is_encrypted:
                return jsonify({"error": "Cannot process encrypted PDF files"}), 400
            
            text_content = ""
            
            # Extract text from each page with error handling
            for page_num in range(len(pdf_reader.pages)):
                try:
                    page = pdf_reader.pages[page_num]
                    text_content += page.extract_text()
                except Exception as page_error:
                    print(f"Error extracting text from page {page_num + 1}: {str(page_error)}")
                    continue
            
            if not text_content.strip():
                return jsonify({"error": "Could not extract text from PDF. Please ensure the PDF contains readable text"}), 400

            # Process the extracted text based on document type
            try:
                if document_type == 'resume':
                    summary = process_resume(text_content)
                    keywords = extract_resume_keywords(text_content)
                    structure = analyze_resume_structure(text_content)
                    metrics = calculate_resume_metrics(text_content)
                elif document_type == 'educational':
                    summary = process_educational_content(text_content)
                    keywords = extract_educational_keywords(text_content)
                    structure = analyze_educational_structure(text_content)
                    metrics = calculate_educational_metrics(text_content)
                else:
                    summary = summarize_text(text_content)
                    print(f"Summary generated: {summary}")  # Check the generated summary
                    keywords = extract_keywords(text_content)
                    structure = {
                        "total_pages": len(pdf_reader.pages),
                        "potential_headings": extract_headings(text_content),
                        "important_sentences": extract_important_sentences(text_content)
                    }
                    metrics = calculate_general_metrics(text_content, len(pdf_reader.pages))
                
                complexity = text_complexity(text_content)
                readability = analyze_readability(text_content)
                
                response_data = {
                    "summary": summary,
                    "keywords": keywords,
                    "complexity": complexity,
                    "readability": readability,
                    "structure": structure,
                    "metrics": metrics
                }
                
                return jsonify(response_data), 200
                
            except Exception as processing_error:
                print(f"Error processing PDF content: {str(processing_error)}")
                error_message = str(processing_error)
                if "too short for summarization" in error_message.lower():
                    return jsonify({"error": "The document is too short to generate a meaningful summary"}), 400
                return jsonify({"error": f"Error processing PDF content: {error_message}"}), 500
                
        except PyPDF2.PdfReadError as pdf_error:
            print(f"PDF Read Error: {str(pdf_error)}")
            return jsonify({"error": "Invalid or corrupted PDF file"}), 400
            
    except Exception as e:
        print(f"Error handling PDF file: {str(e)}")
        return jsonify({"error": f"Error handling PDF file: {str(e)}"}), 500

def process_resume(text):
    """Specialized processing for resume content"""
    try:
        doc = nlp(text)
        
        # Extract key sections
        sections = {
            'experience': [],
            'education': [],
            'skills': [],
            'contact': []
        }
        
        current_section = None
        for sent in doc.sents:
            sent_text = sent.text.strip().lower()
            if any(keyword in sent_text for keyword in ['experience', 'work history']):
                current_section = 'experience'
            elif 'education' in sent_text:
                current_section = 'education'
            elif 'skills' in sent_text:
                current_section = 'skills'
            elif any(keyword in sent_text for keyword in ['email', 'phone', 'address']):
                current_section = 'contact'
            
            if current_section:
                sections[current_section].append(sent.text.strip())
        
        # Create a structured summary
        summary_parts = []
        if sections['experience']:
            summary_parts.append("Professional Experience: " + " ".join(sections['experience'][:3]))
        if sections['education']:
            summary_parts.append("Education: " + " ".join(sections['education'][:2]))
        if sections['skills']:
            summary_parts.append("Key Skills: " + " ".join(sections['skills'][:3]))
        
        if not summary_parts:
            return "Could not identify standard resume sections. Please ensure the document is properly formatted as a resume."
            
        return " ".join(summary_parts)
    except Exception as e:
        print(f"Error processing resume: {str(e)}")
        raise Exception("Error processing resume format")
    


def process_educational_content(text):
    """Specialized processing for educational content"""
    doc = nlp(text)
    
    # Extract key concepts and learning objectives
    concepts = []
    objectives = []
    definitions = []
    
    for sent in doc.sents:
        sent_text = sent.text.strip()
        if any(keyword in sent_text.lower() for keyword in ['define', 'means', 'refers to']):
            definitions.append(sent_text)
        elif any(keyword in sent_text.lower() for keyword in ['learn', 'understand', 'objective']):
            objectives.append(sent_text)
        elif len(sent_text.split()) < 20 and any(ent.label_ in ['CONCEPT', 'TERM'] for ent in sent.ents):
            concepts.append(sent_text)
    
    # Create a structured educational summary
    summary_parts = []
    if objectives:
        summary_parts.append("Learning Objectives: " + " ".join(objectives[:2]))
    if concepts:
        summary_parts.append("Key Concepts: " + " ".join(concepts[:3]))
    if definitions:
        summary_parts.append("Important Definitions: " + " ".join(definitions[:2]))
    
    return " ".join(summary_parts)

def extract_resume_keywords(text):
    """Extract keywords specific to resumes"""
    doc = nlp(text)
    keywords = []
    
    # Look for skills, technologies, and qualifications
    skill_patterns = ['years of experience', 'proficient in', 'expertise in', 'certified']
    for token in doc:
        if any(pattern in token.text.lower() for pattern in skill_patterns):
            keywords.append({
                'word': token.text,
                'definition': 'Professional skill or qualification'
            })
    
    return keywords

def extract_educational_keywords(text):
    """Extract keywords specific to educational content"""
    doc = nlp(text)
    keywords = []
    
    # Look for technical terms and concepts
    for sent in doc.sents:
        for token in sent:
            if token.pos_ in ['NOUN', 'PROPN'] and len(token.text) > 3:
                context = sent.text
                keywords.append({
                    'word': token.text,
                    'definition': f"Context: {context}"
                })
    
    return keywords[:10]  # Limit to top 10 keywords

def analyze_resume_structure(text):
    """Analyze the structure of a resume"""
    sections = {
        'experience_section': False,
        'education_section': False,
        'skills_section': False,
        'total_sections': 0
    }
    
    doc = nlp(text)
    for sent in doc.sents:
        sent_lower = sent.text.lower()
        if 'experience' in sent_lower:
            sections['experience_section'] = True
            sections['total_sections'] += 1
        elif 'education' in sent_lower:
            sections['education_section'] = True
            sections['total_sections'] += 1
        elif 'skills' in sent_lower:
            sections['skills_section'] = True
            sections['total_sections'] += 1
    
    return sections

def analyze_educational_structure(text):
    """Analyze the structure of educational content"""
    structure = {
        'chapters': [],
        'sections': [],
        'subsections': [],
        'has_summary': False,
        'has_exercises': False
    }
    
    doc = nlp(text)
    current_chapter = None
    
    for sent in doc.sents:
        sent_text = sent.text.strip()
        sent_lower = sent_text.lower()
        
        if 'chapter' in sent_lower:
            current_chapter = sent_text
            structure['chapters'].append(sent_text)
        elif current_chapter and sent_text.isupper():
            structure['sections'].append(sent_text)
        elif 'summary' in sent_lower:
            structure['has_summary'] = True
        elif any(word in sent_lower for word in ['exercise', 'practice', 'problem']):
            structure['has_exercises'] = True
    
    return structure

def calculate_resume_metrics(text):
    """Calculate metrics specific to resumes"""
    words = text.split()
    sentences = list(nlp(text).sents)  # Use SpaCy for sentence tokenization
    
    return {
        'total_words': len(words),
        'total_sentences': len(sentences),
        'estimated_reading_time': f"{max(1, len(words) // 200)} minutes",
        'experience_mentions': len(re.findall(r'experience|work|project', text.lower())),
        'skill_mentions': len(re.findall(r'skill|proficient|expertise', text.lower()))
    }

def calculate_educational_metrics(text):
    """Calculate metrics specific to educational content"""
    words = text.split()
    sentences = list(nlp(text).sents)  # Use SpaCy for sentence tokenization
    
    return {
        'total_words': len(words),
        'total_sentences': len(sentences),
        'estimated_reading_time': f"{max(1, len(words) // 200)} minutes",
        'concept_mentions': len(re.findall(r'concept|definition|theory', text.lower())),
        'example_mentions': len(re.findall(r'example|instance|illustration', text.lower())),
        'exercise_mentions': len(re.findall(r'exercise|practice|problem', text.lower()))
    }

def calculate_general_metrics(text, total_pages):
    """Calculate metrics for general documents"""
    words = text.split()
    sentences = list(nlp(text).sents)  # Use SpaCy for sentence tokenization
    
    return {
        'total_words': len(words),
        'total_sentences': len(sentences),
        'total_pages': total_pages,
        'estimated_reading_time': f"{max(1, len(words) // 200)} minutes",
        'average_words_per_page': len(words) // max(1, total_pages)
    }

def extract_headings(text):
    """Extract potential headings from the text"""
    doc = nlp(text)
    headings = []
    
    for sent in doc.sents:
        if len(sent.text.strip()) < 100 and sent.text.strip().endswith('\n'):
            headings.append(sent.text.strip())
    
    return headings[:10]  # Limit to top 10 headings

# Function to extract timestamps from the video transcript
def extract_timestamps(transcript):
    # This is a placeholder implementation. You need to replace it with your actual logic.
    # For example, if your transcript is a list of tuples (timestamp, text):
    timestamps = []
    for entry in transcript:
        # Assuming entry is a tuple like (timestamp, text)
        timestamp = entry[0]  # Get the timestamp
        timestamps.append(timestamp)
    return timestamps

@app.route('/summarize_video', methods=['POST'])
def summarize_video():
    try:
        data = request.get_json()
        video_url = data.get("video_url", "").strip()
        
        if not video_url:
            return jsonify({"error": "No video URL provided"}), 400
        
        # Extract transcript
        transcript = extract_transcript(video_url)
        
        if not transcript:
            return jsonify({"error": "Failed to extract transcript"}), 500
        
        # Summarize the transcript
        summary = summarize_text(transcript)
        
        return jsonify({"summary": summary}), 200

    except Exception as e:
        print(f"Error summarizing video: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

def extract_transcript(video_url):
    # Extract the video ID from the URL
    video_id = video_url.split("v=")[-1]
    if "&" in video_id:
        video_id = video_id.split("&")[0]

    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        # Combine the transcript into a single string
        return " ".join([entry['text'] for entry in transcript])
    except Exception as e:
        print(f"Error extracting transcript: {str(e)}")
        return None

def summarize_text(text):
    try:
        summary = summarizer(text, max_length=150, min_length=30, do_sample=False)
        return summary[0]['summary_text']
    except Exception as e:
        print(f"Error summarizing text: {str(e)}")
        return "Summary generation failed."

if __name__ == '__main__':
    # Ensure static directory exists at startup
    static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
    if not os.path.exists(static_dir):
        try:
            os.makedirs(static_dir, mode=0o755)
            print(f"Created static directory at: {static_dir}")
        except Exception as e:
            print(f"Error creating static directory: {str(e)}")
            sys.exit(1)
    
    # Ensure the directory is writable
    if not os.access(static_dir, os.W_OK):
        print(f"Error: Static directory {static_dir} is not writable")
        sys.exit(1)

    app.run(port=5000, debug=True)