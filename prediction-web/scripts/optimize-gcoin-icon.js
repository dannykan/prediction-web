const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'public', 'images', 'G_coin_icon.png');
const tempPath = path.join(__dirname, '..', 'public', 'images', 'G_coin_icon_optimized_temp.png');
const outputPath = path.join(__dirname, '..', 'public', 'images', 'G_coin_icon.png');

async function optimizeIcon() {
  try {
    console.log('🖼️  优化 G coin icon...');
    
    // 读取原始图片
    const metadata = await sharp(inputPath).metadata();
    console.log(`原始尺寸: ${metadata.width}x${metadata.height}, 大小: ${(metadata.size / 1024).toFixed(2)}KB`);
    
    // 优化：压缩并保持质量
    await sharp(inputPath)
      .resize(256, 256, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({
        quality: 80,
        compressionLevel: 9,
        adaptiveFiltering: true
      })
      .toFile(tempPath);
    
    // 替换原文件
    fs.renameSync(tempPath, outputPath);
    
    const optimizedStats = fs.statSync(outputPath);
    const originalStats = fs.statSync(inputPath);
    
    console.log(`✅ 优化完成！`);
    console.log(`原始大小: ${(originalStats.size / 1024).toFixed(2)}KB`);
    console.log(`优化后: ${(optimizedStats.size / 1024).toFixed(2)}KB`);
    console.log(`节省: ${((1 - optimizedStats.size / originalStats.size) * 100).toFixed(1)}%`);
  } catch (error) {
    console.error('❌ 优化失败:', error);
    process.exit(1);
  }
}

optimizeIcon();
