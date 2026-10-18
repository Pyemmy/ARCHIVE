export type TrackKind = 'file' | 'youtube' | 'spotify' | 'audiomack';

export interface Track {
  id: string;
  title: string;
  artist: string;
  kind: TrackKind;
  src: string;
  cover: string;
  credit: string;
  licence: string;
  durationLabel: string;
}

export const TRACKS: Track[] = [
  {
    id: 'trk-dundun',
    title: 'Yoruba Talking Drum (Dùndún) Performance',
    artist: 'Yoruba Traditional Drummers',
    kind: 'file',
    src: '/audio/yoruba-dundun.mp3',
    cover: '/img/mu-inst-2.jpg',
    credit: 'Wikimedia Commons / Recorded in Nigeria',
    licence: 'Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)',
    durationLabel: '0:38',
  },
  {
    id: 'trk-okonko',
    title: 'Okonko Drum Rhythm',
    artist: 'Igbo Ceremonial Drummers',
    kind: 'file',
    src: '/audio/okonko-drum.mp3',
    cover: '/img/mu-inst-1.jpg',
    credit: 'Wikimedia Commons / Open Cultural Heritage Archive',
    licence: 'Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)',
    durationLabel: '1:20',
  },
  {
    id: 'trk-fela',
    title: 'Water No Get Enemy',
    artist: 'Fela Anikulapo Kuti & Africa 70',
    kind: 'youtube',
    src: 'https://www.youtube-nocookie.com/embed/IQBC5URoF0s?enablejsapi=1',
    cover: '/img/mu-inst-3.jpg',
    credit: 'Knitting Factory Records / Kalakuta Sunrise',
    licence: 'Official YouTube Audio Stream (Standard YouTube Licence)',
    durationLabel: '9:50',
  },
];
