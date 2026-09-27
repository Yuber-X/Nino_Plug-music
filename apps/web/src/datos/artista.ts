/**
 * Catálogo del artista.
 *
 * ⚠ DATOS DE ARRANQUE, no definitivos: salen del catálogo público de Apple
 * Music (artista 1357803085) porque el cliente todavía no entregó la lista curada ni
 * los audios finales. Los `adelanto` son los clips de 30 segundos que Apple
 * publica para previsualización — sirven para construir y probar el
 * reproductor, NO para la versión que se publique. Cuando lleguen las pistas
 * definitivas se reemplaza este archivo por los archivos del cliente.
 *
 * Las versiones alternas (Slowed + Reverb, Speed Up, Acustic) quedaron fuera a
 * propósito: en la web son ruido, el visitante busca el tema.
 */

export interface Tema {
  id: number;
  titulo: string;
  lanzamiento: string;
  genero: string;
  duracionMs: number;
  arte: string;
  adelanto: string;
  apple: string;
}

export const artista = {
  nombre: 'Skinny Xander',
  proyecto: 'Ni\u00f1o Plug',
  origen: 'Rep\u00fablica Dominicana',
  generos: ['Trap', 'Rap', 'Dembow'],
  desde: 2020,
  enlaces: {
    instagram: 'https://www.instagram.com/skinny.xander/',
    youtube: 'https://www.youtube.com/channel/UC6oo-8F1Y5wkpSe3wzPzNOg',
    appleMusic: 'https://music.apple.com/us/artist/skinny-xander/1357803085',
    deezer: 'https://www.deezer.com/artist/14284887',
  },
} as const;

export const temas: Tema[] = [
  {
    id: 6778083035,
    titulo: 'CONMIGO ES MEJOR',
    lanzamiento: '2026-06-17',
    genero: 'Urbano latino',
    duracionMs: 145532,
    arte: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/e8/51/08/e851082a-7148-b1de-c488-ad7a0a47708f/4611.jpg/1000x1000bb.jpg',
    adelanto: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/06/5b/29/065b2901-8320-8dee-0a80-02cfd1ab343f/mzaf_17913889222047174957.plus.aac.p.m4a',
    apple: 'https://music.apple.com/us/album/conmigo-es-mejor/6778083030?i=6778083035&uo=4'
  },
  {
    id: 6764108143,
    titulo: 'PA TI',
    lanzamiento: '2026-05-07',
    genero: 'Hip-Hop/Rap',
    duracionMs: 115304,
    arte: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/94/76/d6/9476d6f5-9550-50c7-5753-9fc7766b017a/4448.jpg/1000x1000bb.jpg',
    adelanto: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ab/1b/f2/ab1bf27e-d00c-39e1-59fc-4cbc7c2e10b8/mzaf_6841333206173460535.plus.aac.p.m4a',
    apple: 'https://music.apple.com/us/album/pa-ti/1895643008?i=6764108143&uo=4'
  },
  {
    id: 6762696531,
    titulo: 'LUNA',
    lanzamiento: '2026-04-20',
    genero: 'Soul',
    duracionMs: 94459,
    arte: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/f5/a4/1d/f5a41da0-fffd-9d0f-20db-acc8c4407be2/4368.jpg/1000x1000bb.jpg',
    adelanto: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/1d/16/fc/1d16fce7-9798-fac9-d20f-f9bcfd8939f3/mzaf_15196211741732780850.plus.aac.p.m4a',
    apple: 'https://music.apple.com/us/album/luna/1894968580?i=6762696531&uo=4'
  },
  {
    id: 6762696307,
    titulo: 'Nightmare',
    lanzamiento: '2026-04-19',
    genero: 'Hip-Hop/Rap',
    duracionMs: 109140,
    arte: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/ae/78/63/ae78639b-8b12-15ff-8269-98243939fb84/4363.jpg/1000x1000bb.jpg',
    adelanto: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/b5/17/58/b517580f-24f7-d240-4d55-96b165da555b/mzaf_9995823699408628267.plus.aac.p.m4a',
    apple: 'https://music.apple.com/us/album/nightmare/1894968602?i=6762696307&uo=4'
  },
  {
    id: 1885894155,
    titulo: 'Pain Freestyle',
    lanzamiento: '2026-03-31',
    genero: 'Hip-Hop/Rap',
    duracionMs: 87824,
    arte: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/c1/6d/3e/c16d3e8a-f8d7-947b-5eb3-20d58ec11617/4238.jpg/1000x1000bb.jpg',
    adelanto: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/09/c1/55/09c155ed-8878-12cc-107e-6975ef76a512/mzaf_14313857466336728428.plus.aac.p.m4a',
    apple: 'https://music.apple.com/us/album/pain-freestyle/1885894154?i=1885894155&uo=4'
  },
  {
    id: 1886085879,
    titulo: 'Loco Por Ti',
    lanzamiento: '2026-03-24',
    genero: 'Modern Dancehall',
    duracionMs: 139389,
    arte: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/0c/f4/93/0cf493fc-c918-ae34-f63d-cda8544f7bd4/4224.jpg/1000x1000bb.jpg',
    adelanto: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/b2/b7/24/b2b724ea-608a-9a0a-29d8-cc6a5404110f/mzaf_3539398653590067275.plus.aac.p.m4a',
    apple: 'https://music.apple.com/us/album/loco-por-ti/1886085878?i=1886085879&uo=4'
  },
  {
    id: 1886093402,
    titulo: 'BEBA',
    lanzamiento: '2026-03-24',
    genero: 'Soul',
    duracionMs: 148274,
    arte: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/61/3d/48/613d4887-c58d-00cb-50bf-51de3ae4dd9d/4233.jpg/1000x1000bb.jpg',
    adelanto: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/de/6b/41/de6b4170-e664-ccef-b5ad-cc556e3f9f5b/mzaf_8611299900803707502.plus.aac.p.m4a',
    apple: 'https://music.apple.com/us/album/beba/1886093400?i=1886093402&uo=4'
  },
  {
    id: 1881891400,
    titulo: 'Todo De Ti',
    lanzamiento: '2026-03-04',
    genero: 'Dance',
    duracionMs: 147800,
    arte: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/4e/88/c2/4e88c265-42d7-4013-829c-5c3db2a3d531/artwork.jpg/1000x1000bb.jpg',
    adelanto: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/9f/f8/01/9ff80167-b397-fe7c-8bd9-a89fc1e1c605/mzaf_14274511060923245952.plus.aac.p.m4a',
    apple: 'https://music.apple.com/us/album/todo-de-ti/1881891399?i=1881891400&uo=4'
  },
  {
    id: 1881143054,
    titulo: 'Damisela',
    lanzamiento: '2026-03-01',
    genero: 'Latin',
    duracionMs: 165094,
    arte: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/94/bb/fd/94bbfdcb-d147-8662-6340-bbabaea35c2a/artwork.jpg/1000x1000bb.jpg',
    adelanto: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/90/2d/0b/902d0bee-05f9-e187-e8b1-7ad55ffd249a/mzaf_16292751471144577171.plus.aac.p.m4a',
    apple: 'https://music.apple.com/us/album/damisela/1881143053?i=1881143054&uo=4'
  },
  {
    id: 1880584079,
    titulo: 'LEJOS',
    lanzamiento: '2026-02-22',
    genero: 'Urbano latino',
    duracionMs: 127295,
    arte: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/d3/61/6c/d3616c48-9db9-183c-d4e9-55b9f7e7738a/artwork.jpg/1000x1000bb.jpg',
    adelanto: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/3c/f9/cb/3cf9cb69-8c2a-ae23-ce19-e77b8028e566/mzaf_3748332227160754506.plus.aac.p.m4a',
    apple: 'https://music.apple.com/us/album/lejos/1880584078?i=1880584079&uo=4'
  },
  {
    id: 1879065470,
    titulo: 'PERREAR',
    lanzamiento: '2026-02-21',
    genero: 'Reggae',
    duracionMs: 110271,
    arte: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e2/8e/6e/e28e6eb4-94da-c2c0-9fe3-b27dc6cb5cb3/artwork.jpg/1000x1000bb.jpg',
    adelanto: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e5/79/81/e57981ba-2066-c66e-e3e3-40fc09cc26af/mzaf_9079172870692399180.plus.aac.p.m4a',
    apple: 'https://music.apple.com/us/album/perrear/1879065469?i=1879065470&uo=4'
  },
  {
    id: 1879276186,
    titulo: 'La Playa',
    lanzamiento: '2026-02-20',
    genero: 'Reggae',
    duracionMs: 110587,
    arte: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/98/91/8b/98918b7d-c7b0-517b-5c71-0946208a8483/artwork.jpg/1000x1000bb.jpg',
    adelanto: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/21/cc/72/21cc7242-63db-752d-59cb-71c5d1c4a8d1/mzaf_9882221653899762249.plus.aac.p.m4a',
    apple: 'https://music.apple.com/us/album/la-playa/1879276185?i=1879276186&uo=4'
  },
  {
    id: 1878176199,
    titulo: 'Fe',
    lanzamiento: '2026-02-17',
    genero: 'Urbano latino',
    duracionMs: 193560,
    arte: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/05/eb/af/05ebafb8-7d52-3b93-dbe2-65272b3ac084/artwork.jpg/1000x1000bb.jpg',
    adelanto: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/30/57/65/30576569-699b-18a7-8221-4e8df75a9abf/mzaf_14931601469568092242.plus.aac.p.m4a',
    apple: 'https://music.apple.com/us/album/fe/1878176198?i=1878176199&uo=4'
  },
  {
    id: 1870919378,
    titulo: 'Dolor',
    lanzamiento: '2026-01-21',
    genero: 'R&B/Soul',
    duracionMs: 77526,
    arte: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/02/2b/d3/022bd348-a261-4819-94ac-68ce8643327d/artwork.jpg/1000x1000bb.jpg',
    adelanto: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/17/9f/ca/179fca00-5207-1e5e-42a1-34b8642b0baf/mzaf_2240141367693876664.plus.aac.p.m4a',
    apple: 'https://music.apple.com/us/album/dolor/1870919377?i=1870919378&uo=4'
  }
];
