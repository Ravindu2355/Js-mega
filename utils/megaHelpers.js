const MAX_DOWNLOAD_BYTES = 50 * 1024 * 1024; // 50 MB

// recursively collect files in folder
async function collectFiles(node, out = []) {
  if (typeof node.loadAttributes === 'function') {
    try { await node.loadAttributes(); } catch {} // ignore errors
  }

  if (node.directory) {
    const children = node.children || [];
    for (let child of children) {
      await collectFiles(child, out);
    }
    return out;
  }

  const id = node.downloadId || node.nodeId || node.publicId || null;
  const keyBuf = node.key || node._key || null;
  const key = keyBuf ? Buffer.from(keyBuf).toString('base64') : null;
  out.push({ id, key, name: node.name || null, size: node.size || null });
  return out;
}

module.exports = { collectFiles, MAX_DOWNLOAD_BYTES };
