/**
 * Nextflix — Google Drive video envanteri
 *
 * KULLANIM:
 * 1. https://script.google.com → Yeni proje → bu kodu yapıştır.
 * 2. FOLDER_ID'yi filmlerin bulunduğu Drive klasörünün ID'siyle değiştir.
 *    (Klasör linki: https://drive.google.com/drive/folders/FOLDER_ID)
 * 3. `run` fonksiyonunu çalıştır, izinleri onayla.
 * 4. Klasöre `nextflix-sources.json` adında bir dosya yazılır + Loglara basılır.
 *    Bu JSON'u indir → projedeki `data/sources.json` olarak kaydet.
 * 5. Dosyaları R2/Bunny'e taşıdıktan sonra her kaydın `url` alanını
 *    yeni public adresle güncelle (kind: "mp4" veya "hls").
 *    Geçici olarak Drive'da kalacaksan kind: "drive" bırakabilirsin.
 * 6. `npm run import:sources` ile TMDB eşleştirip veritabanına yaz.
 */

// Buraya klasörün ID'sini VEYA tam linkini yapıştırabilirsin.
// Örn: "105oQuwuf38ojTm3vG2WyMefElYQYLyXQ"
//  ya da "https://drive.google.com/drive/folders/105o...XQ?usp=drive_link"
const FOLDER_ID = "https://drive.google.com/drive/folders/105oQuwuf38ojTm3vG2WyMefElYQYLyXQ?usp=drive_link"

const VIDEO_EXT = ["mp4", "mkv", "webm", "mov", "avi", "m4v"]

function extractFolderId(value) {
  // /folders/ID veya ?id=ID veya düz ID
  const byPath = value.match(/\/folders\/([a-zA-Z0-9_-]+)/)
  if (byPath) return byPath[1]
  const byQuery = value.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (byQuery) return byQuery[1]
  return value.trim()
}

function run() {
  const out = []
  const folderId = extractFolderId(FOLDER_ID)
  walk(DriveApp.getFolderById(folderId), out)

  const json = JSON.stringify(out, null, 2)
  Logger.log(json)

  // Sonucu Drive'a JSON dosyası olarak yaz
  const folder = DriveApp.getFolderById(folderId)
  folder.createFile("nextflix-sources.json", json, "application/json")
  Logger.log("Toplam " + out.length + " video. nextflix-sources.json yazıldı.")
}

function walk(folder, out) {
  const files = folder.getFiles()
  while (files.hasNext()) {
    const file = files.next()
    const name = file.getName()
    const ext = name.split(".").pop().toLowerCase()
    if (VIDEO_EXT.indexOf(ext) === -1) continue

    const parsed = parseTitle(name)
    out.push({
      title: parsed.title,
      year: parsed.year || undefined,
      mediaType: "movie",
      kind: "drive",
      url: "https://drive.google.com/file/d/" + file.getId() + "/view",
      fileName: name,
    })
  }
  const subFolders = folder.getFolders()
  while (subFolders.hasNext()) {
    walk(subFolders.next(), out)
  }
}

function parseTitle(fileName) {
  let base = fileName.replace(/\.[^.]+$/, "") // uzantıyı at
  base = base.replace(/[._]+/g, " ").trim()

  let year = null
  const yearMatch = base.match(/(19|20)\d{2}/)
  if (yearMatch) {
    year = parseInt(yearMatch[0], 10)
    base = base.slice(0, yearMatch.index).trim()
  }

  // kalite/etiket kalıntılarını temizle
  base = base
    .replace(/\b(1080p|720p|480p|2160p|4k|bluray|brrip|webrip|web-dl|hdrip|x264|x265|hevc|aac|tr|dual|turkce|dublaj|altyazi)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim()

  return { title: base || fileName, year: year }
}
