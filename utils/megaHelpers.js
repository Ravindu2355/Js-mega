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

//Only Video Ex
const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.webm', '.mov', '.avi', '.flv', '.wmv', '.mpeg', 'm4v'];
//check for video
function isVideoFile(name) {
  if (!name) return false;
  const lower = name.toLowerCase();
  return VIDEO_EXTENSIONS.some(ext => lower.endsWith(ext));
}

//circular to json AI 
/**
 * Safely convert MEGA _File/folder node to JSON (avoiding circular refs)
 * Only includes: id, key, name, size, directory flag, and children array
 */
function megaNodeToJson(node) {
  // Get basic info
  const id = node.downloadId || node.nodeId || node.publicId || null;
  const keyBuf = node.key || node._key || null;
  const key = keyBuf ? Buffer.from(keyBuf).toString('base64') : null;

  const json = {
    id,
    key,
    name: node.name || null,
    size: node.size || null,
    directory: !!node.directory,
  };

  // If directory, recursively map children
  if (node.directory && Array.isArray(node.children) && node.children.length) {
    json.children = node.children.map(child => megaNodeToJson(child));
  }

  return json;
}

/**
 * Example usage:
 * const rootJson = megaNodeToJson(rootNode);
 * res.json(rootJson);
 * By AI Chat GPT
 */

// Recursively collect only video files from a MEGA node
async function collectVideoFiles(node, out = []) {
  // Load attributes if directory or file has no size/name
  if (typeof node.loadAttributes === 'function') {
    try { await node.loadAttributes(); } catch {} // ignore errors
  }

  // If directory, iterate children
  if (node.directory) {
    const children = node.children || [];
    for (let child of children) {
      await collectVideoFiles(child, out);
    }
    return out;
  }

  // Only push if file is a video
  if (isVideoFile(node.name)) {
    const id = node.downloadId || node.nodeId || node.publicId || null;
    const keyBuf = node.key || node._key || null;
    const key = keyBuf ? Buffer.from(keyBuf).toString('base64') : null;
    out.push({ id, key, name: node.name || null, size: node.size || null });
  }

  return out;
}

module.exports = { collectFiles, collectVideoFiles, megaNodeToJson, MAX_DOWNLOAD_BYTES };
