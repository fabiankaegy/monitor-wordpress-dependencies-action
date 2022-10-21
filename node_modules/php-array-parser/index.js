var engine = require('php-parser')
var parser = new engine({
  parser: { extractDoc: true },
  ast: { withPositions: true },
})

/**
 * The PHP array parser.
 * @param  {String} source The PHP source contents.
 * @return {Object}        The parsed contents.
 */
var parse = function (source) {
  var ast = parser.parseEval(source)
  var array = ast.children.find((child) => child.kind === 'array')
  return parseValue(array)
}

/**
 * Parse a PHP expression to JavaScript
 * @param  {Object} expr The AST PHP expression.
 * @return {*}           A JavaScript object or value.
 */
function parseValue(expr) {
  switch(expr.kind) {
    case 'array':
      if (expr.items.length === 0) {
        return [];
      }
      var isKeyed = expr.items.every((item) => item.key !== null)
      var items = expr.items.map(parseValue)
      if (isKeyed) {
        items = items.reduce((acc, val) => Object.assign({}, acc, val), {})
      }
      return items
    case 'entry':
      if (expr.key) {
        return { [parseKey(expr.key)]: parseValue(expr.value) }
      }
      return parseValue(expr.value)
    case 'string':
      return expr.value
    case 'number':
      return parseInt(expr.value, 10)
    case 'boolean':
      return expr.value
    default:
      throw new Error(`Unexpected PHP value: "${expr.kind}", details: ${JSON.stringify(expr)}`)
  }
}

/**
 * Parse a PHP expression to JavaScript
 * @param  {Object} expr The AST PHP expression.
 * @return {*}           A JavaScript object or value.
 */
function parseKey(expr) {
  switch(expr.kind) {
    case 'string':
      return expr.value
    case 'number':
      return parseInt(expr.value, 10)
    case 'boolean':
      return expr.value ? 1 : 0;
    default:
      throw new Error(`Unexpected PHP key: "${expr.kind}", details: ${JSON.stringify(expr)}`)
  }
}

module.exports = { parse }
