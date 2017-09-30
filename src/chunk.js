import postcss from 'postcss';

/**
 * Get the number of selectors for a given node.
 * @param {Object} node CSS node in question.
 * @returns {Number} Total number of selectors associated with that node.
 */
const getSelLength = (node) => {
  if (node.type === 'rule') {
    return node.selectors.length;
  }
  if (node.type === 'atrule' && node.nodes) {
    return 1 + node.nodes.reduce((memo, n) => {
      return memo + getSelLength(n);
    }, 0);
  }
  return 0;
};

/**
 * PostCSS plugin that splits the generated result into multiple results based
 * on number of selectors.
 * @param {Number} size Maximum number of rules in a single file.
 * @param {Boolean} bySize Split by size.
 * @param {Boolean} byComment Split by comment.
 * @param {String} commentPattern Comment pattern to look for.
 * @param {Function} result Options passed to `postcss.toResult()`
 * @returns {Object} `postcss` plugin instance.
 */
export default postcss.plugin('postcss-chunk', ({
  size = 4000,
  bySize = true,
  byComment = true,
  commentPattern = '! split:',
  result: genResult = () => {
    return {};
  },
} = {}) => {
  return (css, result) => {
    const chunks = [];
    let count;
    let chunk;

    // Create a new chunk that holds current result.
    const nextChunk = (currentChunkName) => {
      count = 0;
      chunk = css.clone({nodes: []});
      chunk.chunkName = currentChunkName;
      chunks.push(chunk);
    };

    // Walk the nodes. When we overflow the selector count, then start a new
    // chunk. Collect the nodes into the current chunk.
    css.nodes.forEach((n) => {
      const selCount = getSelLength(n);
      const commentPatternRegEx = new RegExp(commentPattern, 'gi');
      if (!chunk ||
          (bySize && (count + selCount > size)) ||
          (byComment && (n.type === 'comment'
            && n.text.match(commentPatternRegEx)))) {
        let currentChunkName = 'chunk';
        if (typeof n.text === 'string') {
          const res = n.text.match(commentPatternRegEx);
          const splitPieces = n.text.split(':');
          if (res !== null && splitPieces[1] !== undefined){
            currentChunkName = splitPieces[1];
          }
        }
        nextChunk(currentChunkName);
      }
      chunk.nodes.push(n);
      count += selCount;
    });

    // Output the results.
    result.chunks = chunks.map((c, i) => {
      return c.toResult(genResult(i, c));
    });
  };
});
