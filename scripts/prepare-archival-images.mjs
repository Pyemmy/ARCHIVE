import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TARGET_DIR = path.resolve('public/img');
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

const ARCHIVAL_SEARCH = {
  'ph-hist-1.jpg': {
    query: 'Yoruba chief formal portrait studio 1910',
    title: 'Studio Portrait of a Chief and Attendants',
    culture: 'Yoruba Culture, Nigeria',
    bgColor: '#2a241e'
  },
  'ph-hist-2.jpg': {
    query: 'Nigerian women traditional braided hairstyle vintage studio portrait',
    title: 'Portrait of Two Women with Elaborate Hairstyles',
    culture: 'Ife / Yoruba Artist, Nigeria',
    bgColor: '#1e1c18'
  },
  'ph-hist-3.jpg': {
    query: 'Lagos marina waterfront colonial harbour trade boats historical',
    title: 'Market Day Gathering along the Marina',
    culture: 'Lagos Colony Photographer',
    bgColor: '#282a2b'
  },
  'mu-inst-1.jpg': {
    query: 'slit drum wooden carved african musical instrument museum',
    title: 'Carved Slit Drum (Ikoro)',
    culture: 'Igbo Artist, Nigeria',
    bgColor: '#2b1f18'
  },
  'mu-inst-2.jpg': {
    query: 'talking drum dundun yoruba tension drum',
    title: 'Tension Drum with Beaded Strap (Dùndún)',
    culture: 'Yoruba Artist, Southwestern Nigeria',
    bgColor: '#24201a'
  },
  'mu-inst-3.jpg': {
    query: 'benin carved ivory horn trumpet museum',
    title: 'Royal Ivory Side-Blown Trumpet (Akohen)',
    culture: 'Edo / Kingdom of Benin, Nigeria',
    bgColor: '#262420'
  },
  'fa-textile-1.jpg': {
    query: 'adire eleko indigo dyed cloth yoruba pattern',
    title: 'Indigo-Dyed Resist Cloth (Adire Eleko)',
    culture: 'Yoruba Woman Dyer, Abeokuta, Nigeria',
    bgColor: '#121e33'
  },
  'fa-textile-2.jpg': {
    query: 'aso-oke strip woven prestige cloth yoruba',
    title: 'Prestige Strip-Woven Cloth (Aso-Oke)',
    culture: 'Yoruba Weaver, Iseyin, Nigeria',
    bgColor: '#301c26'
  },
  'fa-textile-3.jpg': {
    query: 'beaded crown yoruba beaded crown ade akete',
    title: 'Akete Beaded Ceremonial Crown',
    culture: 'Yoruba Artist, Nigeria',
    bgColor: '#281a18'
  },
  'fa-textile-4.jpg': {
    query: 'akwete cloth igbo nigerian handwoven textile',
    title: 'Akwete Weft-Float Patterned Wrapper',
    culture: 'Ndoki Igbo Weaver, Akwete, Nigeria',
    bgColor: '#22261a'
  },
  'de-obj-1.jpg': {
    query: 'benin bronze plaque relief warriors court',
    title: 'Cast Brass Commemorative Relief Plaque',
    culture: 'Edo / Kingdom of Benin, Nigeria',
    bgColor: '#33261a'
  },
  'de-obj-2.jpg': {
    query: 'opon ifa divination tray yoruba carved wood',
    title: 'Carved Wood Divination Board (Opon Ifa)',
    culture: 'Yoruba Sculptor, Osi-Ilorin Workshop, Nigeria',
    bgColor: '#2a2016'
  },
  'de-obj-3.jpg': {
    query: 'beaded bag apo ifa yoruba beaded pouch',
    title: 'Beaded Diviner Bag (Apo Ifa)',
    culture: 'Yoruba Beadworker, Nigeria',
    bgColor: '#1f2824'
  }
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

function generateArtisticFallback(destPath, title, culture, bgColor) {
  const fontArg = fs.existsSync('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf')
    ? '-font /usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
    : '';
  execSync(
    `convert -size 1200x900 xc:"${bgColor}" ` +
    `-fill "#1e1e1c" -draw "rectangle 40,40 1160,860" ` +
    `-fill "#E43D27" -draw "circle 600,450 600,680" ` +
    `-fill "${bgColor}" -draw "circle 600,450 600,560" ` +
    `-fill "#E8F044" -draw "rectangle 120,446 1080,454" ` +
    `${fontArg} -fill "#F0E8D8" -pointsize 38 -gravity center -annotate +0-40 "${title.toUpperCase()}" ` +
    `${fontArg} -fill "#E4D9C0" -pointsize 22 -gravity center -annotate +0+50 "${culture.toUpperCase()}" ` +
    `${fontArg} -fill "#8B8982" -pointsize 18 -gravity south -annotate +0+80 "ARCHIVAL OBJECT RECORD • ROYAL / CEREMONIAL COLLECTION" ` +
    `-quality 88 "${destPath}"`
  );
  console.log(`✓ Created archival render for ${path.basename(destPath)}`);
}

async function downloadAndResize(url, destPath, title, culture, bgColor) {
  const tmpFile = `/tmp/dl_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ArchiveMuseumApplet/1.0 (joinforgeacademy@gmail.com)' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(tmpFile, buf);
    execSync(`convert "${tmpFile}" -resize 1200x900^ -gravity center -extent 1200x900 -quality 88 "${destPath}"`);
    console.log(`✓ Fetched archival image for ${path.basename(destPath)}`);
    return true;
  } catch (err) {
    console.warn(`Download error for ${title}: ${err.message}. Generating art-directed record.`);
    generateArtisticFallback(destPath, title, culture, bgColor);
    return false;
  } finally {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
}

async function main() {
  for (const [filename, item] of Object.entries(ARCHIVAL_SEARCH)) {
    const dest = path.join(TARGET_DIR, filename);
    const url = await getWikimediaImageUrl(item.query);
    if (url) {
      await downloadAndResize(url, dest, item.title, item.culture, item.bgColor);
    } else {
      generateArtisticFallback(dest, item.title, item.culture, item.bgColor);
    }
  }
  console.log('Finished updating archival images!');
}

main().catch(console.error);
