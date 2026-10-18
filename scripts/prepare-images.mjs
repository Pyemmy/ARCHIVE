import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TARGET_DIR = path.resolve('public/img');
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

const SEARCH_QUERIES = {
  'ph-darkroom.jpg': 'safelight darkroom photography red',
  'ph-contact-sheet.jpg': 'contact sheet film photography negative',
  'ph-negatives.jpg': 'film negative loupe 35mm',
  'ph-studio.jpg': 'photography studio backdrop stool portrait',
  'mu-record-crate.jpg': 'vinyl records crate crate lp',
  'mu-turntable.jpg': 'turntable vinyl tonearm record player',
  'mu-sleeve.jpg': 'vinyl record sleeve graphic design cover',
  'mu-cassette.jpg': 'cassette tape magnetic ribbon tape',
  'fa-fabric-folds.jpg': 'african textile cloth wax print adire',
  'fa-swatches.jpg': 'fabric swatches samples textile pattern',
  'fa-tailor-table.jpg': 'tailor workbench shears fabric pattern chalk',
  'fa-rail-light.jpg': 'garment rack coat clothes rail warehouse',
  'de-poster-wall.jpg': 'torn posters wall wheatpaste graffiti layers',
  'de-type-blocks.jpg': 'wooden movable type letterpress blocks ink',
  'de-packaging.jpg': 'cardboard packaging carton die cut box unfolded',
  'now-phone.jpg': 'smartphone screen darkness glowing audio waveform',
  'now-street-poster.jpg': 'street poster corrugated fence wall lagos',
  'now-night-road.jpg': 'night highway long exposure light trails traffic lagos bridge',
  'inh-archive-boxes.jpg': 'archive document boxes repository shelving cartons',
};

async function getWikimediaImageUrl(query) {
  try {
    const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(
      query + ' filetype:bitmap'
    )}&gsrlimit=5&prop=imageinfo&iiprop=url`;
    const res = await fetch(endpoint, {
      headers: { 'User-Agent': 'ArchiveMuseumApplet/1.0 (joinforgeacademy@gmail.com)' }
    });
    const data = await res.json();
    if (!data.query || !data.query.pages) return null;
    const pages = Object.values(data.query.pages);
    for (const page of pages) {
      if (page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url) {
        const u = page.imageinfo[0].url;
        // Avoid tiff or svg or pdf
        if (/\.(jpg|jpeg|png)$/i.test(u.split('?')[0])) {
          return u;
        }
      }
    }
  } catch (err) {
    console.warn(`Query failed for "${query}":`, err.message);
  }
  return null;
}

async function downloadAndResize(url, destPath, label, bgColor = '#181816') {
  const tmpFile = `/tmp/dl_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ArchiveMuseumApplet/1.0 (joinforgeacademy@gmail.com)' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(tmpFile, buf);
    // Convert and resize with ImageMagick
    execSync(`convert "${tmpFile}" -resize 1200x900^ -gravity center -extent 1200x900 -quality 86 "${destPath}"`);
    console.log(`✓ Generated ${path.basename(destPath)} from Wikimedia`);
    return true;
  } catch (err) {
    console.warn(`Download failed for ${label}: ${err.message}. Using fallback generator.`);
    generateArtisticFallback(destPath, label, bgColor);
    return false;
  } finally {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
}

function generateArtisticFallback(destPath, label, bgColor) {
  // Generate high quality editorial still-life with ImageMagick
  const fontArg = fs.existsSync('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf')
    ? '-font /usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
    : '';
  execSync(
    `convert -size 1200x900 xc:"${bgColor}" ` +
    `-fill "#262624" -draw "rectangle 60,60 1140,840" ` +
    `-fill "#E43D27" -draw "circle 600,450 600,650" ` +
    `-fill "#11110F" -draw "circle 600,450 600,530" ` +
    `-fill "#E8F044" -draw "rectangle 200,445 1000,455" ` +
    `${fontArg} -fill "#F0E8D8" -pointsize 42 -gravity center -annotate +0+0 "${label.toUpperCase()}" ` +
    `${fontArg} -fill "#8B8982" -pointsize 20 -gravity south -annotate +0+100 "ARCHIVE • DIGITAL MUSEUM OF NIGERIAN CREATIVE HISTORY" ` +
    `-quality 88 "${destPath}"`
  );
  console.log(`✓ Generated artistic fallback for ${path.basename(destPath)}`);
}

async function main() {
  // Generate tex-paper.jpg (subtle warm grain paper texture)
  const paperPath = path.join(TARGET_DIR, 'tex-paper.jpg');
  if (!fs.existsSync(paperPath)) {
    execSync(
      `convert -size 512x512 xc:"#E4D9C0" ` +
      `+noise Gaussian -colorspace gray -fill "#E4D9C0" -tint 30 ` +
      `-quality 90 "${paperPath}"`
    );
    console.log('✓ Generated tex-paper.jpg');
  }

  // Tex paper check

  for (const [filename, query] of Object.entries(SEARCH_QUERIES)) {
    const dest = path.join(TARGET_DIR, filename);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      continue;
    }
    const url = await getWikimediaImageUrl(query);
    if (url) {
      await downloadAndResize(url, dest, filename);
    } else {
      generateArtisticFallback(dest, filename.replace('.jpg', '').replace('-', ' '), '#151513');
    }
  }

  console.log('All image assets in public/img are ready!');
}

main().catch(console.error);
