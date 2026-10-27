
function generateDistractors(correctBlocks, language) {
    if (!Array.isArray(correctBlocks) || correctBlocks.length === 0) {
        return [];
    }

    const transformations = [
        { from: '===', to: '!==' },
        { from: '!==', to: '===' },
        { from: '>=', to: '<' },
        { from: '<=', to: '>' },
        { from: '>', to: '<' },
        { from: '<', to: '>' },
        { from: ' + ', to: ' - ' },
        { from: ' - ', to: ' + ' },
        { from: '&&', to: '||' },
        { from: '||', to: '&&' }
    ];

    const correctContents = new Set(
        correctBlocks.map(block =>
            (typeof block === 'string'
                ? block
                : block.blockContent || ''
            ).trim()
        )
    );

    const distractors = new Set();

    for (const block of correctBlocks) {
        const content = (
            typeof block === 'string'
                ? block
                : block.blockContent || ''
        ).trim();

        if (!content) continue;

        for (const rule of transformations) {
            if (!content.includes(rule.from)) continue;

            const incorrectContent = content
                .replace(rule.from, rule.to)
                .trim();

            if (
                incorrectContent &&
                incorrectContent !== content &&
                !correctContents.has(incorrectContent)
            ) {
                distractors.add(incorrectContent);
            }
        }

        // Add a simple output distractor for JavaScript/Python.
        if (/^console\.log\(/.test(content)) {
            const incorrectContent = content.replace(
                'console.log(',
                'console.error('
            );

            if (!correctContents.has(incorrectContent.trim())) {
                distractors.add(incorrectContent.trim());
            }
        } else if (/^print\(/.test(content) && language.toLowerCase() === 'python') {
            const incorrectContent = content.replace(
                /^print\(/,
                'input('
            );

            if (!correctContents.has(incorrectContent.trim())) {
                distractors.add(incorrectContent.trim());
            }
        }
    }

    return [...distractors]
        .filter(content => !correctContents.has(content))
        .slice(0, 5)
        .map(blockContent => ({ blockContent }));
}

module.exports = { generateDistractors };
