/**
 * Retorna o primeiro elemento mais profundo (maior profundidade) dentro de um nó raiz.
 * "Primeiro" aqui significa o primeiro encontrado na travessia DFS (ordem dos filhos).
 *
 * Uso:
 * import getDeepestElement from '../utils/getDeepestElement';
 * const root = document.querySelector('.brand');
 * const deepest = getDeepestElement(root);
 * // agora `deepest` é o elemento que você pode referir como "esse elemento" ou "elemento atual"
 *
 * @param {Element} root Nó raiz para busca. Se for null ou não for Element, retorna null.
 * @returns {Element|null} O elemento mais profundo encontrado ou null.
 */
function getDeepestElement(root) {
  if (!root || !(root instanceof Element)) return null;

  let maxDepth = -1;
  let deepest = null;

  function dfs(node, depth) {
    const children = Array.from(node.children);
    if (children.length === 0) {
      if (depth > maxDepth) {
        maxDepth = depth;
        deepest = node;
      }
      return;
    }

    for (const child of children) {
      dfs(child, depth + 1);
    }
  }

  dfs(root, 0);
  return deepest;
}

export default getDeepestElement;
