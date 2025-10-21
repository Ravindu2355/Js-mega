const express = require('express');
const router = express.Router();
const { File } = require('megajs');
const { collectFiles, collectVideoFiles, megaNodeToJson, MAX_DOWNLOAD_BYTES } = require('../utils/megaHelpers');
//home...
router.get('/', (req, res) => {
  res.send('Hello World — MEGA extractor is alive');
});

//mega url...
router.post('/mega', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'missing url in body' });

  try {
    const root = File.fromURL(url);
    await root.loadAttributes();
    const result = [];
    await collectFiles(root, result);
    return res.json({ files: result });
  } catch (err) {
    console.error('Error extracting MEGA url', err);
    return res.status(500).json({ error: 'failed to parse MEGA url', detail: String(err) });
  }
});

//return only videos....
router.post('/megav', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'missing url in body' });

  try {
    const root = File.fromURL(url);
    await root.loadAttributes();
    const result = [];
    await collectVideoFiles(root, result);
    return res.json({ files: result });
  } catch (err) {
    console.error('Error extracting MEGA url', err);
    return res.status(500).json({ error: 'failed to parse MEGA url', detail: String(err) });
  }
});

//return first attributes...
router.post('/megaat', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'missing url in body' });

  try {
    const root = File.fromURL(url);
    await root.loadAttributes();
    //const result = [];
    //await collectFiles(root, result);
    return res.json({ files: megaNodeToJson(root)});
  } catch (err) {
    console.error('Error extracting MEGA url', err);
    return res.status(500).json({ error: 'failed to parse MEGA url', detail: String(err) });
  }
});



router.post('/megadecurl', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'missing id or key' });

  try {
    //const keyBuf = Buffer.from(key, 'base64');
    const node = File.fromURL(url); //new File({ downloadId: id, key: keyBuf });
    await node.loadAttributes();

    if ((node.size || 0) > MAX_DOWNLOAD_BYTES) {
      return res.status(413).json({ error: 'file too large', size: node.size });
    }

    const buffer = await node.downloadBuffer();
    const filename = name || node.name || 'file';
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  } catch (err) {
    console.error('Error downloading MEGA file', err);
    return res.status(500).json({ error: 'failed to download/decrypt', detail: String(err) });
  }
});


router.post('/megadec', async (req, res) => {
  const { id, key, name } = req.body;
  if (!id || !key) return res.status(400).json({ error: 'missing id or key' });

  try {
    const keyBuf = Buffer.from(key, 'base64');
    const node = new File({ downloadId: id, key: keyBuf });
    await node.loadAttributes();

    if ((node.size || 0) > MAX_DOWNLOAD_BYTES) {
      return res.status(413).json({ error: 'file too large', size: node.size });
    }

    const buffer = await node.downloadBuffer();
    const filename = name || node.name || 'file';
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  } catch (err) {
    console.error('Error downloading MEGA file', err);
    return res.status(500).json({ error: 'failed to download/decrypt', detail: String(err) });
  }
});

module.exports = router;
