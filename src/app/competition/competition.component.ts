import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-competition',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './competition.component.html',
  styleUrls: ['./competition.component.css']
})
export class CompetitionComponent implements OnInit {
  dsaCode: string = '';
  selectedAlgorithm: string = 'bubble-sort'; // Default selected algorithm
  currentAnimation: any[] = [];
  currentStep: number = 0;
  explanation: string = '';
  isAnimating: boolean = false;
  animationSpeed: number = 1000; // milliseconds
  animationInterval: any;
  
  // Sample DSA visualizations (you can expand this based on your needs)
  visualizations: { [key: string]: any } = {
    'bubble-sort': {
      name: 'Bubble Sort',
      description: 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.'
    },
    'binary-search': {
      name: 'Binary Search',
      description: 'A search algorithm that finds the position of a target value within a sorted array.'
    },
    'quick-sort': {
      name: 'Quick Sort',
      description: 'A divide-and-conquer algorithm that sorts by partitioning an array into smaller sub-arrays.'
    },
    'merge-sort': {
      name: 'Merge Sort',
      description: 'A divide-and-conquer algorithm that sorts by dividing the array into halves, sorting them, and merging them back together.'
    },
    'insertion-sort': {
      name: 'Insertion Sort',
      description: 'A simple sorting algorithm that builds the final sorted array one item at a time.'
    },
    'selection-sort': {
      name: 'Selection Sort',
      description: 'A simple comparison-based sorting algorithm that divides the input list into two parts: a sorted and an unsorted part.'
    },
    'dfs': {
      name: 'Depth-First Search',
      description: 'An algorithm for traversing or searching tree or graph data structures.'
    }
    // Add more algorithms as needed
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  analyzeDSACode() {
    // Reset previous state
    this.currentAnimation = [];
    this.currentStep = 0;
    this.explanation = '';
    this.stopAnimation();

    try {
      // Validate code here (basic example)
      if (!this.dsaCode.trim()) {
        this.explanation = 'Please enter some code to analyze.';
        return;
      }

      // Use selected algorithm for analysis
      switch (this.selectedAlgorithm) {
        case 'bubble-sort':
          this.generateBubbleSortAnimation();
          break;
        case 'binary-search':
          this.generateBinarySearchAnimation();
          break;
        case 'quick-sort':
          this.generateQuickSortAnimation();
          break;
        case 'merge-sort':
          this.generateMergeSortAnimation();
          break;
        case 'insertion-sort':
          this.generateInsertionSortAnimation();
          break;
        case 'selection-sort':
          this.generateSelectionSortAnimation();
          break;
        case 'dfs':
          this.generateDFSAnimation();
          break;
        default:
          this.explanation = 'Selected algorithm is not recognized.';
      }
    } catch (error) {
      this.explanation = 'Error analyzing the code. Please check the syntax and try again.';
    }
  }

  generateBubbleSortAnimation() {
    const array = [64, 34, 25, 12, 22, 11, 90];
    this.currentAnimation = [{ 
      array: array.slice(),
      comparing: [-1, -1],
      swapped: false,
      step: 'Initial array'
    }];
    
    for (let i = 0; i < array.length; i++) {
      for (let j = 0; j < array.length - i - 1; j++) {
        // Add comparison state
        this.currentAnimation.push({
          array: array.slice(),
          comparing: [j, j + 1],
          swapped: false,
          step: `Comparing elements at positions ${j} and ${j + 1}`
        });

        if (array[j] > array[j + 1]) {
          // Swap elements
          [array[j], array[j + 1]] = [array[j + 1], array[j]];
          
          // Add swap state
          this.currentAnimation.push({
            array: array.slice(),
            comparing: [j, j + 1],
            swapped: true,
            step: `Swapped ${array[j]} and ${array[j + 1]}`
          });
        }
      }
    }
    
    // Add final state
    this.currentAnimation.push({
      array: array.slice(),
      comparing: [-1, -1],
      swapped: false,
      step: 'Array is now sorted!'
    });
    
    this.startAnimation();
  }

  generateBinarySearchAnimation() {
    const sortedArray = [11, 12, 22, 25, 34, 64, 90];
    const target = 25;
    
    this.currentAnimation = [{
      array: sortedArray,
      left: 0,
      right: sortedArray.length - 1,
      mid: Math.floor((0 + sortedArray.length - 1) / 2),
      step: `Starting binary search for target value ${target}`
    }];
    
    let left = 0;
    let right = sortedArray.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      
      this.currentAnimation.push({
        array: sortedArray,
        left: left,
        right: right,
        mid: mid,
        step: `Checking middle element at position ${mid}: ${sortedArray[mid]}`
      });
      
      if (sortedArray[mid] === target) {
        this.currentAnimation.push({
          array: sortedArray,
          left: left,
          right: right,
          mid: mid,
          step: `Found target ${target} at position ${mid}!`
        });
        break;
      } else if (sortedArray[mid] < target) {
        left = mid + 1;
        this.currentAnimation.push({
          array: sortedArray,
          left: left,
          right: right,
          mid: mid,
          step: `${sortedArray[mid]} is less than ${target}, searching right half`
        });
      } else {
        right = mid - 1;
        this.currentAnimation.push({
          array: sortedArray,
          left: left,
          right: right,
          mid: mid,
          step: `${sortedArray[mid]} is greater than ${target}, searching left half`
        });
      }
    }
    
    this.startAnimation();
  }

  generateQuickSortAnimation() {
    const array = [64, 34, 25, 12, 22, 11, 90];
    this.currentAnimation = [];
    
    const quickSort = (arr: number[], left: number, right: number) => {
      if (left < right) {
        const pivotIndex = this.partition(arr, left, right);
        quickSort(arr, left, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, right);
      }
    };

    quickSort(array, 0, array.length - 1);
    
    // Add final state
    this.currentAnimation.push({
      array: array.slice(),
      comparing: [-1, -1],
      swapped: false,
      step: 'Array is now sorted!'
    });
    
    this.startAnimation();
  }

  partition(arr: number[], left: number, right: number): number {
    const pivot = arr[right]; // Choose the rightmost element as pivot
    let i = left - 1; // Pointer for the smaller element

    for (let j = left; j < right; j++) {
        // Add comparison state
        this.currentAnimation.push({
            array: arr.slice(),
            comparing: [j, right],
            swapped: false,
            step: `Comparing ${arr[j]} with pivot ${pivot}`
        });

        if (arr[j] < pivot) {
            i++; // Increment index of smaller element
            [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap
            
            // Add swap state
            this.currentAnimation.push({
                array: arr.slice(),
                comparing: [i, j],
                swapped: true,
                step: `Swapped ${arr[i]} and ${arr[j]}`
            });
        }
    }
    [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]]; // Swap pivot to correct position
    return i + 1; // Return the pivot index
  }

  generateMergeSortAnimation() {
    const array = [64, 34, 25, 12, 22, 11, 90];
    this.currentAnimation = [];

    const mergeSort = (arr: number[]): number[] => {
      if (arr.length <= 1) return arr; // Base case
      const mid = Math.floor(arr.length / 2);
      const left = mergeSort(arr.slice(0, mid)); // Sort left half
      const right = mergeSort(arr.slice(mid)); // Sort right half
      return this.merge(left, right); // Merge sorted halves
    };

    const sortedArray = mergeSort(array);
    
    // Add final state
    this.currentAnimation.push({
      array: sortedArray,
      comparing: [-1, -1],
      swapped: false,
      step: 'Array is now sorted!'
    });
    
    this.startAnimation();
  }

  merge(left: number[], right: number[]): number[] {
    const result: number[] = [];
    let i = 0, j = 0;

    while (i < left.length && j < right.length) {
        // Add comparison state
        this.currentAnimation.push({
            array: [...left, ...right],
            comparing: [i, j],
            swapped: false,
            step: `Comparing ${left[i]} and ${right[j]}`
        });

        if (left[i] < right[j]) {
            result.push(left[i++]); // Add smaller element to result
        } else {
            result.push(right[j++]); // Add smaller element to result
        }
    }
    return result.concat(left.slice(i)).concat(right.slice(j)); // Concatenate remaining elements
  }

  generateInsertionSortAnimation() {
    const array = [64, 34, 25, 12, 22, 11, 90];
    this.currentAnimation = [{ 
      array: array.slice(),
      comparing: [-1, -1],
      swapped: false,
      step: 'Initial array'
    }];
    
    for (let i = 1; i < array.length; i++) {
      const key = array[i];
      let j = i - 1;

      // Move elements of array[0..i-1], that are greater than key,
      // to one position ahead of their current position
      while (j >= 0 && array[j] > key) {
        this.currentAnimation.push({
          array: array.slice(),
          comparing: [j, i],
          swapped: false,
          step: `Moving ${array[j]} to the right`
        });
        array[j + 1] = array[j];
        j--;
      }
      array[j + 1] = key; // Place key in its correct position

      // Add state after inserting key
      this.currentAnimation.push({
        array: array.slice(),
        comparing: [-1, -1],
        swapped: false,
        step: `Inserted ${key} at position ${j + 1}`
      });
    }
    
    // Add final state
    this.currentAnimation.push({
      array: array.slice(),
      comparing: [-1, -1],
      swapped: false,
      step: 'Array is now sorted!'
    });
    
    this.startAnimation();
  }

  generateSelectionSortAnimation() {
    const array = [64, 34, 25, 12, 22, 11, 90];
    this.currentAnimation = [{ 
      array: array.slice(),
      comparing: [-1, -1],
      swapped: false,
      step: 'Initial array'
    }];
    
    for (let i = 0; i < array.length - 1; i++) {
      let minIndex = i;

      for (let j = i + 1; j < array.length; j++) {
        // Add comparison state
        this.currentAnimation.push({
          array: array.slice(),
          comparing: [minIndex, j],
          swapped: false,
          step: `Comparing ${array[minIndex]} and ${array[j]}`
        });

        if (array[j] < array[minIndex]) {
          minIndex = j; // Update minIndex if a smaller element is found
        }
      }

      // Swap the found minimum element with the first element
      if (minIndex !== i) {
        [array[i], array[minIndex]] = [array[minIndex], array[i]];
        
        // Add swap state
        this.currentAnimation.push({
          array: array.slice(),
          comparing: [i, minIndex],
          swapped: true,
          step: `Swapped ${array[i]} and ${array[minIndex]}`
        });
      }
    }
    
    // Add final state
    this.currentAnimation.push({
      array: array.slice(),
      comparing: [-1, -1],
      swapped: false,
      step: 'Array is now sorted!'
    });
    
    this.startAnimation();
  }

  generateDFSAnimation() {
    const tree = {
      value: 1,
      left: {
        value: 2,
        left: { value: 4, left: null, right: null },
        right: { value: 5, left: null, right: null }
      },
      right: {
        value: 3,
        left: { value: 6, left: null, right: null },
        right: { value: 7, left: null, right: null }
      }
    };
    this.currentAnimation = [];
    
    const dfs = (node: any) => {
      if (!node) return;
      this.currentAnimation.push({
        array: [node.value],
        comparing: [-1, -1],
        swapped: false,
        step: `Visiting node ${node.value}`
      });
      dfs(node.left);
      dfs(node.right);
    };

    dfs(tree);
    
    // Add final state
    this.currentAnimation.push({
      array: [],
      comparing: [-1, -1],
      swapped: false,
      step: 'DFS traversal complete!'
    });
    
    this.startAnimation();
  }

  startAnimation() {
    if (this.currentAnimation.length === 0) return;
    
    this.isAnimating = true;
    this.currentStep = 0;
    this.updateExplanation();
    
    this.animationInterval = setInterval(() => {
      if (this.currentStep < this.currentAnimation.length - 1 && this.isAnimating) {
        this.currentStep++;
        this.updateExplanation();
      } else {
        this.stopAnimation();
      }
    }, this.animationSpeed);
  }

  updateExplanation() {
    if (this.currentStep < this.currentAnimation.length) {
      const currentState = this.currentAnimation[this.currentStep];
      this.explanation = `Step ${this.currentStep + 1} of ${this.currentAnimation.length}: ${currentState.step}`;
    }
  }

  stopAnimation() {
    this.isAnimating = false;
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  }

  adjustSpeed(faster: boolean) {
    if (faster) {
      this.animationSpeed = Math.max(100, this.animationSpeed - 200);
    } else {
      this.animationSpeed = Math.min(2000, this.animationSpeed + 200);
    }
    
    if (this.isAnimating) {
      this.stopAnimation();
      this.startAnimation();
    }
  }

  reset() {
    this.dsaCode = '';
    this.currentAnimation = [];
    this.currentStep = 0;
    this.explanation = '';
    this.stopAnimation();
  }

  getAlgorithmCode(): string {
    const algorithmCodes: { [key: string]: string } = {
        'bubble-sort': `function bubbleSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}`,
        'binary-search': `function binarySearch(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
        'quick-sort': `function quickSort(arr) {
    if (arr.length <= 1) return arr;
    const pivot = arr[arr.length - 1];
    const left = arr.filter(x => x < pivot);
    const right = arr.filter(x => x > pivot);
    return [...quickSort(left), pivot, ...quickSort(right)];
}`,
        'merge-sort': `function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    return merge(mergeSort(arr.slice(0, mid)), mergeSort(arr.slice(mid)));
}

function merge(left, right) {
    const result = [];
    while (left.length && right.length) {
        if (left[0] < right[0]) result.push(left.shift());
        else result.push(right.shift());
    }
    return [...result, ...left, ...right];
}`,
        'insertion-sort': `function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}`,
        'selection-sort': `function selectionSort(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        let minIndex = i;
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIndex]) minIndex = j;
        }
        [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
    }
    return arr;
}`,
        'dfs': `function dfs(node) {
    if (!node) return;
    console.log(node.value);
    dfs(node.left);
    dfs(node.right);
}`
    };
    return algorithmCodes[this.selectedAlgorithm] || 'No code available for the selected algorithm.';
  }
}
