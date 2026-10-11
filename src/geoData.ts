/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EventLocation, TimelineItem } from "./types";

export interface GeoPreset {
  nameSr: string;
  nameEn: string;
  lat: number;
  lng: number;
  descriptionSr?: string;
  descriptionEn?: string;
  aliases: string[];
}

export const HISTORICAL_GEO_PRESETS: GeoPreset[] = [
  {
    nameSr: "Jerusalim (Solomonov hram)",
    nameEn: "Jerusalem (Solomon's Temple)",
    lat: 31.7683,
    lng: 35.2137,
    descriptionSr: "Prestonica Judeje, centar obožavanja i lokacija Solomonovog hrama",
    descriptionEn: "Capital of Judea, religious center and site of Solomon's Temple",
    aliases: ["jerusalim", "jerusalem", "sion", "zion", "hram", "solomonov hram", "judeja", "judea"]
  },
  {
    nameSr: "Vavilon",
    nameEn: "Babylon",
    lat: 32.5422,
    lng: 44.4210,
    descriptionSr: "Prestonica Vavilonskog carstva na reci Eufrat",
    descriptionEn: "Capital of the Babylonian Empire on the Euphrates river",
    aliases: ["vavilon", "babylon", "navuhodonosor", "nebuchadnezzar", "vavilonsko ropstvo", "vavilonska kula"]
  },
  {
    nameSr: "Niniva",
    nameEn: "Nineveh",
    lat: 36.3587,
    lng: 43.1528,
    descriptionSr: "Drevna prestonica Asirskog carstva (današnji Mosul)",
    descriptionEn: "Ancient capital of the Assyrian Empire (modern Mosul)",
    aliases: ["niniva", "nineveh", "asirija", "assyria", "sanhiriv", "sennecherib", "jona", "jonah"]
  },
  {
    nameSr: "Ur Haldejski",
    nameEn: "Ur of the Chaldees",
    lat: 30.9622,
    lng: 46.1044,
    descriptionSr: "Rodno mesto patrijarha Avrama u donjoj Mesopotamiji",
    descriptionEn: "Birthplace of Abraham in southern Mesopotamia",
    aliases: ["ur", "ur haldejski", "ur of the chaldees", "avram", "abraham", "mesopotamija", "mesopotamia"]
  },
  {
    nameSr: "Haran",
    nameEn: "Haran",
    lat: 36.8667,
    lng: 39.0167,
    descriptionSr: "Mesto boravka Tare i Avrama pre polaska u Hanan",
    descriptionEn: "Dwelling place of Terah and Abraham before journeying to Canaan",
    aliases: ["haran", "charran", "tara", "terah"]
  },
  {
    nameSr: "Sinajska gora (Horiv)",
    nameEn: "Mount Sinai (Horeb)",
    lat: 28.5394,
    lng: 33.9750,
    descriptionSr: "Gora gde je Mojsije primio Deset Božjih zapovesti",
    descriptionEn: "Mountain where Moses received the Ten Commandments",
    aliases: ["sinaj", "sinajska gora", "mount sinai", "horiv", "horeb", "mojsije", "moses", "zakon"]
  },
  {
    nameSr: "Egipat (Memfis / Kairo)",
    nameEn: "Egypt (Memphis / Cairo)",
    lat: 29.8499,
    lng: 31.2585,
    descriptionSr: "Drevno carstvo na Nilu, faraonska prestonica",
    descriptionEn: "Ancient empire on the Nile, pharaonic capital",
    aliases: ["egipat", "egypt", "memfis", "memphis", "faraon", "pharaoh", "misir", "nil", "nile", "gosen", "goshen"]
  },
  {
    nameSr: "Aleksandrija",
    nameEn: "Alexandria",
    lat: 31.2001,
    lng: 29.9187,
    descriptionSr: "Helensko i rimsko sedište kulture, Septuaginte i biblioteke",
    descriptionEn: "Hellenistic and Roman hub of learning, Septuagint and library",
    aliases: ["aleksandrija", "alexandria", "septuaginta", "septuagint"]
  },
  {
    nameSr: "Suza (Šušan)",
    nameEn: "Susa (Shushan)",
    lat: 32.1903,
    lng: 48.2436,
    descriptionSr: "Zimska prestonica Persijskog carstva (knjige o Jestiri i Nemiji)",
    descriptionEn: "Winter capital of the Persian Empire (Esther and Nehemiah)",
    aliases: ["suza", "shushan", "susa", "persija", "persia", "jestira", "esther", "nemija", "nehemiah", "kserks", "xerxes"]
  },
  {
    nameSr: "Persepolis",
    nameEn: "Persepolis",
    lat: 29.9354,
    lng: 52.8914,
    descriptionSr: "Ceremonijalna prestonica Ahemenidskog Persijskog carstva",
    descriptionEn: "Ceremonial capital of the Achaemenid Persian Empire",
    aliases: ["persepolis", "kir", "cyrus", "darije", "darius", "ahemenidi"]
  },
  {
    nameSr: "Damask",
    nameEn: "Damascus",
    lat: 33.5138,
    lng: 36.2765,
    descriptionSr: "Jedan od najstarijih stalno naseljenih gradova, sirijska prestonica",
    descriptionEn: "Ancient continuously inhabited city, Syrian capital",
    aliases: ["damask", "damascus", "sirija", "syria", "arameja", "arameans"]
  },
  {
    nameSr: "Tir",
    nameEn: "Tyre",
    lat: 33.2705,
    lng: 35.1969,
    descriptionSr: "Feničanska pomorska luka i trgovačka prestonica",
    descriptionEn: "Phoenician maritime port and trading empire capital",
    aliases: ["tir", "tyre", "fenikija", "phoenicia", "hiram"]
  },
  {
    nameSr: "Antiohija",
    nameEn: "Antioch",
    lat: 36.2021,
    lng: 36.1606,
    descriptionSr: "Glavni grad Sirije u rimsko doba, rano hrišćansko središte",
    descriptionEn: "Capital of Syria in Roman times, early Christian missionary center",
    aliases: ["antiohija", "antioch", "antakya"]
  },
  {
    nameSr: "Hevron",
    nameEn: "Hebron",
    lat: 31.5326,
    lng: 35.0998,
    descriptionSr: "Grobnica patrijaraha (pećina Mahpela), prva prestonica kralja Davida",
    descriptionEn: "Burial site of the patriarchs (Machpelah), David's first capital",
    aliases: ["hevron", "hebron", "mahpela", "machpelah"]
  },
  {
    nameSr: "Samarija",
    nameEn: "Samaria",
    lat: 32.2778,
    lng: 35.1903,
    descriptionSr: "Prestonica severnog desetoplemenskog kraljevstva Izraela",
    descriptionEn: "Capital of the northern ten-tribe kingdom of Israel",
    aliases: ["samarija", "samaria", "izrael sever", "omri", "ahav", "ahab"]
  },
  {
    nameSr: "Vitlejem",
    nameEn: "Bethlehem",
    lat: 31.7054,
    lng: 35.2024,
    descriptionSr: "Grad Davidov u Judeji",
    descriptionEn: "City of David in Judea",
    aliases: ["vitlejem", "bethlehem", "davidov grad", "efrata", "ephrath"]
  },
  {
    nameSr: "Nazaret",
    nameEn: "Nazareth",
    lat: 32.7019,
    lng: 35.3033,
    descriptionSr: "Grad u Galileji",
    descriptionEn: "City in Lower Galilee",
    aliases: ["nazaret", "nazareth", "galileja", "galilee"]
  },
  {
    nameSr: "Atina",
    nameEn: "Athens",
    lat: 37.9838,
    lng: 23.7275,
    descriptionSr: "Centar klasične grčke filozofije i kulture (Areopag)",
    descriptionEn: "Center of classical Greek philosophy and culture (Areopagus)",
    aliases: ["atina", "athens", "areopag", "grcka", "greece", "elada", "hellas"]
  },
  {
    nameSr: "Korint",
    nameEn: "Corinth",
    lat: 37.9056,
    lng: 22.8800,
    descriptionSr: "Poznata grčka trgovačka luka na prevlaci",
    descriptionEn: "Prominent Greek trading port on the isthmus",
    aliases: ["korint", "corinth", "korincanima", "corinthians"]
  },
  {
    nameSr: "Efes",
    nameEn: "Ephesus",
    lat: 37.9400,
    lng: 27.3400,
    descriptionSr: "Glavni grad rimske provincije Azije (hram boginje Artemide)",
    descriptionEn: "Major port and capital of Roman Asia (Temple of Artemis)",
    aliases: ["efes", "ephesus", "artemida", "efescima"]
  },
  {
    nameSr: "Rim",
    nameEn: "Rome",
    lat: 41.9028,
    lng: 12.4964,
    descriptionSr: "Prestonica Rimskog carstva",
    descriptionEn: "Capital of the Roman Empire",
    aliases: ["rim", "rome", "rimsko carstvo", "roman empire", "cezar", "caesar", "avgust", "augustus"]
  }
];

/**
 * Location resolver for items:
 * ONLY returns explicit valid item.location if provided by the user.
 * Does not synthesize or guess locations automatically.
 */
export function resolveItemLocation(item: TimelineItem): { location: EventLocation; isAutoDetected: boolean } | null {
  if (
    item.location &&
    typeof item.location.lat === "number" &&
    typeof item.location.lng === "number" &&
    !isNaN(item.location.lat) &&
    !isNaN(item.location.lng)
  ) {
    return {
      location: item.location,
      isAutoDetected: false
    };
  }

  return null;
}
