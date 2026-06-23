import { useEffect, useState } from "react";

/**
 * useDeepestElement
 * React hook que, dado um ref para um nó DOM, retorna o primeiro elemento
 * mais profundo dentro daquela árvore. O valor atualiza automaticamente quando
 * o DOM da subárvore muda (MutationObserver).
 *
 * @param {React.RefObject<HTMLElement>} rootRef
 * @returns {HTMLElement|null} deepest element or null
 *
 * Exemplo:
 * const ref = useRef(null);
 * const deepest = useDeepestElement(ref);
 */
function getDeepestElement(root) {
  if (!root || !(root instanceof Element)) return null;

  let maxDepth = -1;
  let deepest = null;

  function dfs(node, depth) {
    const children = node.children;
    if (!children || children.length === 0) {
      if (depth > maxDepth) {
        maxDepth = depth;
        deepest = node;
      }
      return;
    }

    for (let i = 0; i < children.length; i++) {
      dfs(children[i], depth + 1);
    }
  }

  dfs(root, 0);
  return deepest;
}

export default function useDeepestElement(rootRef) {
  const [deepest, setDeepest] = useState(null);

  useEffect(() => {
    const root = rootRef && rootRef.current;
    if (!root) {
      setDeepest(null);
      return;
    }

    // initial compute
    setDeepest(getDeepestElement(root));

    // observe changes to keep value up-to-date
    const observer = new MutationObserver(() => {
      setDeepest(getDeepestElement(root));
    });

    observer.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [rootRef]);

  return deepest;
}
