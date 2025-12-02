import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取图片列表
const imagesDir = path.join(__dirname, '..', 'images');
const images = fs.readdirSync(imagesDir).filter(f => f.endsWith('.png'));

// 读取 3.interactive-archive 中的 firms 数据
const archiveFirmsPath = path.join(__dirname, '..', '3.interactive-archive', 'nyc_firms.json');
const archiveFirms = JSON.parse(fs.readFileSync(archiveFirmsPath, 'utf-8'));

// 匹配函数：将图片文件名与 firm 名称匹配
function matchImageToFirm(imageName, firmName) {
  // 移除文件扩展名
  const imageBase = imageName.replace(/\.png$/i, '').toLowerCase();
  const firmBase = firmName.toLowerCase();
  
  // 移除常见符号和空格，进行模糊匹配
  const normalize = (str) => str
    .replace(/[_\s-]/g, '')
    .replace(/&/g, 'and')
    .replace(/\./g, '')
    .replace(/\(.*?\)/g, '') // 移除括号内容
    .trim();
  
  const normalizedImage = normalize(imageBase);
  const normalizedFirm = normalize(firmBase);
  
  // 精确匹配
  if (normalizedImage === normalizedFirm) return true;
  
  // 检查 firm 名称是否包含图片名称的关键词
  const imageWords = imageBase.split(/[_\s-]/).filter(w => w.length > 2);
  const firmWords = firmBase.split(/[_\s-]/).filter(w => w.length > 2);
  
  // 如果图片名称的所有关键词都在 firm 名称中，则匹配
  if (imageWords.length > 0 && imageWords.every(word => firmWords.some(fw => fw.includes(word) || word.includes(fw)))) {
    return true;
  }
  
  // 特殊匹配规则
  const specialMatches = {
    'techstars': 'techstars',
    'era': 'entrepreneurs roundtable accelerator',
    'new_york_angels': 'new york angels',
    'box_group': 'boxgroup',
    'antler': 'antler',
    'dorm room fund': 'dorm room fund',
    'gaingels': 'gaingels',
    'union square ventures': 'union square ventures',
    'lerer hippeau': 'lerer hippeau',
    'insight partners': 'insight partners',
    'greycroft': 'greycroft',
    'bessemer venture partners': 'bessemer venture partners',
    'thrive capital': 'thrive capital',
    'first_round': 'first round',
    'rre ventures': 'rre ventures',
    'primary venture partners': 'primary venture partners',
    'lux capital': 'lux capital',
    'tiger global': 'tiger global',
    'coatue': 'coatue',
    'blackstone': 'blackstone',
    'kkr': 'kkr',
    'apollo': 'apollo',
    'warburg pincus': 'warburg pincus',
    'cd&r': 'clayton dubilier',
    'general_atlantic': 'general atlantic',
    'fortress': 'fortress investment',
    'centerbridge': 'centerbridge',
    'silver_lake': 'silver lake',
    'cerberus': 'cerberus',
    'goldman_sachs': 'goldman sachs',
    'morgan_stanley': 'morgan stanley',
    'jp_morgan': 'j.p. morgan',
    'bank_of_america': 'bank of america',
    'citigroup': 'citigroup',
    'barclays': 'barclays',
    'ubs': 'ubs',
    'deutsche': 'deutsche bank',
    'jefferies': 'jefferies',
    'rbc_capital_markets': 'rbc capital',
    'blackrock': 'blackrock',
    'vanguard': 'vanguard',
    'fidelity': 'fidelity',
    'state_street': 'state street',
    't_rowe_price': 't. rowe price',
    'invesco': 'invesco',
    'franklin_templeton': 'franklin templeton',
    'alliancebernstein': 'alliancebernstein',
    'neuberger_berman': 'neuberger berman',
  };
  
  for (const [imgKey, firmKey] of Object.entries(specialMatches)) {
    if (imageBase.includes(imgKey) && firmBase.includes(firmKey)) {
      return true;
    }
  }
  
  // 更宽松的匹配：检查主要关键词
  if (imageBase.includes('fortress') && firmBase.includes('fortress')) return true;
  if (imageBase.includes('general') && imageBase.includes('atlantic') && firmBase.includes('general') && firmBase.includes('atlantic')) return true;
  if (imageBase.includes('morgan') && imageBase.includes('stanley') && firmBase.includes('morgan') && firmBase.includes('stanley')) return true;
  
  // 检查是否 firm 名称的主要部分匹配图片名称
  const imageMainWords = imageBase.split(/[_\s-]/).filter(w => w.length > 2);
  if (imageMainWords.length > 0) {
    const allMatch = imageMainWords.every(word => {
      // 检查 firm 名称中是否包含这个词
      if (firmBase.includes(word)) return true;
      // 检查是否有部分匹配
      return firmBase.split(/[_\s-]/).some(fw => fw.includes(word) || word.includes(fw));
    });
    if (allMatch) return true;
  }
  
  return false;
}

// 匹配图片到 firms
const matchedFirms = [];
const usedImages = new Set();

for (const firm of archiveFirms) {
  // 首先检查 firm 是否已经有 logo_url
  let matchedImage = null;
  if (firm.logo_url) {
    // 从 logo_url 中提取图片文件名
    const logoFileName = firm.logo_url.split('/').pop();
    if (images.includes(logoFileName)) {
      matchedImage = logoFileName;
      usedImages.add(logoFileName);
    }
  }
  
  // 如果没有 logo_url，尝试匹配
  if (!matchedImage) {
    for (const image of images) {
      if (matchImageToFirm(image, firm.firm_name)) {
        matchedImage = image;
        usedImages.add(image);
        break;
      }
    }
  }
  
  // 只保留有匹配图片的 firm
  if (matchedImage) {
    matchedFirms.push({
      ...firm,
      logo_url: `/images/${matchedImage}`,
    });
  }
}

console.log(`匹配了 ${matchedFirms.length} 个 firms`);
console.log(`未使用的图片: ${images.filter(img => !usedImages.has(img)).join(', ')}`);

// 保存结果
const outputPath = path.join(__dirname, '..', 'nyc_firms.json');
fs.writeFileSync(outputPath, JSON.stringify(matchedFirms, null, 2), 'utf-8');
console.log(`已保存到 ${outputPath}`);

