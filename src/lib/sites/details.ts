import { STARTER_SITES, type StarterSite } from "./starter"

/**
 * More detail for each starter site: extra history chapters, key facts and
 * visiting tips, added to the starter text (see withDetails). The live site
 * gets them once, only for sites no one has edited in the admin — see
 * lib/db/ensure-schema.ts.
 */
export type SiteDetails = {
  chapters: { heading: string; body: string }[]
  facts: string[]
  tips: string[]
}

export const SITE_DETAILS: Record<string, SiteDetails> = {
  "pyramids-of-giza": {
    chapters: [
      {
        heading: "How they were built",
        body: "No written account of the building survives from the Old Kingdom, but the evidence on the ground tells much of the story. Blocks averaging around two and a half tonnes were cut with copper chisels and stone pounders, dragged on wooden sledges and raised on ramps of mud brick and rubble — archaeologists still debate whether these ran straight, zig-zagged up a face or wound around the pyramid. A tomb painting from Deir el-Bersha shows a colossal statue being hauled on a sledge while a man pours water in front of it, which makes wet sand far easier to pull across.\n\nThe precision is astonishing: the Great Pyramid's sides are aligned to the cardinal points to within a small fraction of a degree. The Greek historian Herodotus, writing some 2,000 years later, was told it took twenty years to build.",
      },
      {
        heading: "Inside the Great Pyramid",
        body: "A narrow passage climbs from the entrance to the Grand Gallery, a soaring corbelled corridor about 8.6 metres high and 47 metres long, which leads to the King's Chamber. Built entirely of granite, it still holds Khufu's empty stone sarcophagus. Above it, five low 'relieving chambers' spread the weight of the stone; on their walls the work gangs painted their names, including Khufu's own.\n\nThe pyramid still keeps secrets. In 2017 the ScanPyramids project, using cosmic-ray particles called muons, detected a large void above the Grand Gallery, and in 2023 a camera pushed through a gap in the stones showed a sealed corridor above the original entrance.",
      },
    ],
    facts: [
      "Time needed: Half a day; a full day with the Grand Egyptian Museum",
      "Getting there: 30–60 minutes by car from central Cairo, depending on traffic",
      "Inside the Great Pyramid: Separate ticket; steep, narrow and hot passages",
    ],
    tips: [
      "Buy tickets for going inside at the main entrance before walking up — numbers can be limited.",
      "Agree any camel or horse ride price, and its length, before you get on.",
    ],
  },
  "great-sphinx": {
    chapters: [
      {
        heading: "Repaired through the ages",
        body: "The Sphinx has been restored many times. Thutmose IV's Dream Stela records that he cleared it of sand around 1400 BC, and blocks of limestone were added to its body and paws in his reign and again in the Ptolemaic and Roman periods to protect the soft, crumbling rock. Modern conservation campaigns — the most extensive between the 1980s and 1998 — replaced failing later repairs and treated the stone against wind and salt damage.",
      },
      {
        heading: "Khafre's valley temple",
        body: "Beside the Sphinx stands the valley temple of Khafre, built of enormous granite-clad limestone blocks with a polished alabaster floor. When Auguste Mariette excavated it in the 1860s, he found the famous seated statue of Khafre in hard diorite, protected by the falcon god Horus, now one of the great treasures of Egyptian sculpture. From here a causeway ran up to the king's pyramid.",
      },
    ],
    facts: [
      "Temple beside it: Valley temple of Khafre, entered on the same ticket",
      "Best light: Late afternoon, facing east towards the Sphinx's face",
    ],
    tips: ["Walk through the valley temple to reach the Sphinx viewing terrace — it's the way the ancient procession came."],
  },
  "grand-egyptian-museum": {
    chapters: [
      {
        heading: "What's inside",
        body: "The museum is designed to hold tens of thousands of objects spanning more than 5,000 years, many never displayed before. Visitors are met in the forecourt by a hanging obelisk of Ramses II, which you can walk beneath to see the cartouche carved on its base, and inside by the colossal Ramses in the atrium. The Grand Staircase rises six storeys past kings, queens and gods, with a view of the pyramids at the top.\n\nThe main galleries are arranged by theme and period, and a separate building holds Khufu's reassembled cedar boat, moved here from beside the Great Pyramid in 2021 in one piece.",
      },
      {
        heading: "Behind the scenes",
        body: "The museum includes one of the largest conservation centres in the world, where specialists treat everything from textiles and papyrus to wooden funerary boats. Much of Tutankhamun's burial equipment — chariots, beds, shrines and linen — was cleaned and conserved here before going on show.",
      },
    ],
    facts: [
      "Time needed: At least half a day; a full day for the Tutankhamun galleries",
      "Distance to the pyramids: About 2 km",
    ],
    tips: ["Keep your ticket: some galleries and the boat museum are checked separately."],
  },
  "egyptian-museum-tahrir": {
    chapters: [
      {
        heading: "Treasures of Tanis",
        body: "Upstairs, one of the museum's least-known highlights is the royal burial treasure from Tanis in the Nile Delta, found by Pierre Montet in 1939–1940. The kings of the 21st and 22nd Dynasties were buried in silver coffins with gold masks and jewellery — a find as rich as Tutankhamun's, overshadowed because it was made as the Second World War began.",
      },
      {
        heading: "Faces from Roman Egypt",
        body: "The museum also shows Fayum mummy portraits: lifelike faces painted on wooden panels in the first centuries AD and placed over the mummies of Egypt's Greek and Roman-era inhabitants. They are among the earliest realistic portraits to survive from the ancient world.",
      },
    ],
    facts: ["Getting there: Sadat metro station, on Tahrir Square", "Museum founder: Auguste Mariette, whose tomb is in the museum garden"],
    tips: ["Galleries can move as objects go to the Grand Egyptian Museum — ask at the entrance what's on show."],
  },
  saqqara: {
    chapters: [
      {
        heading: "Discoveries that keep coming",
        body: "Saqqara is one of the most active excavation sites in Egypt. In 2018 the untouched, brightly painted tomb of the priest Wahtye was opened, and since 2020 Egyptian teams have announced well over a hundred sealed, painted wooden coffins from the Late Period, together with statues, amulets and mummified animals from the sacred animal cemeteries.",
      },
      {
        heading: "Dahshur: the first true pyramids",
        body: "A short drive south, at Dahshur, stand two pyramids of Sneferu, Khufu's father, which show the Egyptians learning how to build a smooth-sided pyramid. The Bent Pyramid changes angle halfway up, probably because the builders feared it would collapse; the Red Pyramid beside it is the first successful true pyramid. Both are far quieter than Giza, and visitors can climb down into the Red Pyramid's chambers.",
      },
    ],
    facts: [
      "Distance from Giza: About 30 minutes by car",
      "Combine with: Memphis (Mit Rahina) and Dahshur on the same day",
    ],
    tips: ["Several mastaba tombs open on a rotating basis — a guide will know which are open that day."],
  },
  "islamic-cairo": {
    chapters: [
      {
        heading: "Sultan Hassan and Al-Rifa'i",
        body: "Below the Citadel stand two giant mosques side by side. The Mosque-Madrasa of Sultan Hassan (1356–1363), built to teach the four schools of Sunni law, has a vast courtyard ringed by four soaring vaulted halls. Its neighbour, the Al-Rifa'i Mosque, looks medieval but was completed in 1912; it holds the tombs of Khedive Ismail, members of Egypt's royal family and the last Shah of Iran.",
      },
      {
        heading: "Walking Al-Muizz Street",
        body: "Al-Muizz li-Din Allah Street was the main avenue of Fatimid Cairo, running from Bab al-Futuh in the north to Bab Zuweila in the south. Restored and largely pedestrianised, it is lined with the Qalawun complex (a mosque, madrasa, mausoleum and hospital of 1284–1285), the Madrasa of Barquq and the elegant Ottoman house of Bayt al-Suhaymi. Climb one of Bab Zuweila's minarets for a view over the rooftops.",
      },
    ],
    facts: [
      "Time needed: A full day for the Citadel, the great mosques and Al-Muizz Street",
      "Getting around: Walk Al-Muizz Street; take a taxi between it and the Citadel",
    ],
    tips: ["Visit Al-Muizz Street in the early evening, when the buildings are lit and the street fills with families."],
  },
  "coptic-cairo": {
    chapters: [
      {
        heading: "The Coptic Museum",
        body: "Founded in 1910 by Marcus Simaika, the Coptic Museum holds the world's largest collection of Egyptian Christian art: carved stone and wood from early churches, icons, manuscripts including pages of the Nag Hammadi texts, and textiles woven from the 4th century onwards. The building itself, with its mashrabiya screens and painted ceilings, is part of the display.",
      },
      {
        heading: "Mosque of Amr ibn al-As",
        body: "A short walk north stands the site of the first mosque built in Egypt, founded in 641–642 by the general Amr ibn al-As after the Arab conquest. Rebuilt and enlarged many times, it is still in use, and the quarter around it — Fustat — was Egypt's capital before Cairo was founded.",
      },
    ],
    facts: ["Getting there: Mar Girgis metro station", "Faiths: Coptic churches, a synagogue and Egypt's first mosque within walking distance"],
    tips: ["Sunday mornings are busy with services — visit on a weekday for quieter churches."],
  },
  karnak: {
    chapters: [
      {
        heading: "A city of temples",
        body: "Karnak is not one temple but several precincts. The Precinct of Amun-Ra alone covers about 25 hectares, and beside it lie the precincts of the goddess Mut and the war god Montu. In the open-air museum inside the complex, archaeologists have rebuilt small shrines that later pharaohs had dismantled and used as filling for their gateways — including the White Chapel of Senusret I, one of the finest Middle Kingdom buildings to survive, and Hatshepsut's Red Chapel.",
      },
      {
        heading: "How the gods travelled",
        body: "At festivals the statue of Amun left his sanctuary in a gilded boat-shrine carried on the shoulders of priests. The long axis of Karnak — pylon after pylon towards the Nile — was built for these processions, and the smaller 'way stations' along the route were resting places for the god's boat.",
      },
    ],
    facts: ["Time needed: 2–3 hours; half a day with the open-air museum", "Open-air museum: Separate ticket inside the complex"],
    tips: ["Enter the open-air museum on the left after the first courtyard — many visitors walk past it."],
  },
  "luxor-temple": {
    chapters: [
      {
        heading: "A mosque on the temple",
        body: "By the Middle Ages, sand and houses had buried much of Luxor Temple. The Mosque of Abu al-Haggag, a 13th-century Sufi saint still honoured with a festival every year, was built on top of the rubble — which is why its doors today open several metres above the temple floor.",
      },
      {
        heading: "Rome in Luxor",
        body: "In the late 3rd century AD, the Romans turned part of Luxor Temple into a shrine of the imperial cult inside a military camp, plastering over the pharaonic reliefs and painting them with scenes of the emperors. Conservators from the American Research Center in Egypt cleaned these rare Roman wall paintings in the 2000s, revealing their colours.",
      },
    ],
    facts: ["Open: Daytime and evening", "Distance to Karnak: About 3 km along the Avenue of Sphinxes"],
    tips: ["Arrive just before sunset to see the temple in daylight and then lit up."],
  },
  "valley-of-the-kings": {
    chapters: [
      {
        heading: "Beyond the famous tombs",
        body: "KV5, the tomb of the sons of Ramses II, is the largest in the valley: since 1995 Kent Weeks's team has mapped well over a hundred corridors and chambers. Across the hills, the Valley of the Queens holds the tomb of Nefertari, Ramses II's chief wife, often called the most beautiful in Egypt for its painted walls (visited on a separate, limited ticket).",
      },
      {
        heading: "The village of the tomb builders",
        body: "The craftsmen who cut and painted the royal tombs lived at Deir el-Medina, a walled village in a nearby valley. Their houses, chapels and small, brilliantly painted family tombs survive, and thousands of their notes on limestone flakes and papyri record wages, absences, loans, quarrels and even a strike — one of the first recorded in history, under Ramses III.",
      },
    ],
    facts: [
      "Time needed: 2–3 hours; half a day with Deir el-Medina",
      "Getting there: 20–30 minutes by car from Luxor's East Bank",
    ],
    tips: ["Visit Deir el-Medina on the same morning — it's close by and much quieter."],
  },
  "temple-of-hatshepsut": {
    chapters: [
      {
        heading: "The chapel of Hathor",
        body: "On the temple's middle terrace, the chapel of the goddess Hathor has columns topped with her face, with cow's ears. Nearby, the Punt reliefs show the expedition ships loaded with incense trees, and even the queen of Punt, drawn with unusual realism.",
      },
      {
        heading: "The royal mummy cache",
        body: "In a cliff shaft just south of the temple, priests of the 21st Dynasty hid the mummies of earlier kings to save them from tomb robbers. The cache, known today as TT320, was traced by the Antiquities Service in 1881 after local families had been selling objects from it; it held the mummies of Seti I, Ramses II and many others, now in the National Museum of Egyptian Civilization in Cairo.",
      },
    ],
    facts: ["Getting there: 20 minutes by car from Luxor's East Bank", "Time needed: About 1–1.5 hours"],
    tips: ["Visit early — the terraces face east and get very hot by late morning."],
  },
  "edfu-kom-ombo": {
    chapters: [
      {
        heading: "Esna",
        body: "Many Nile cruises also stop at Esna, where the Temple of Khnum lies about nine metres below the modern town. A long restoration completed in the 2020s cleaned centuries of soot from its roof and columns, revealing astronomical ceilings and inscriptions in bright original colours.",
      },
      {
        heading: "Measuring the Nile",
        body: "Kom Ombo has a nilometer — a well with steps marked to record the height of the river. The Nile's annual flood decided the harvest, so priests and officials watched these marks closely and set taxes by how high the water rose.",
      },
    ],
    facts: ["By cruise: Edfu and Kom Ombo are standard stops between Luxor and Aswan", "Crocodile Museum: Beside Kom Ombo temple, on the same visit"],
    tips: ["At Edfu, look for the walls carved with the drama of Horus and Seth, near the back of the temple."],
  },
  "abu-simbel": {
    chapters: [
      {
        heading: "Inside the Great Temple",
        body: "Beyond the four colossi, a hall of eight pillars carved as Osiris-figures of Ramses leads into the mountain. Its walls show the Battle of Kadesh in great detail — the Hittite chariots, the Egyptian camp under attack and Ramses charging alone. Side rooms held temple stores, and at the far end sit the four gods of the sanctuary.",
      },
      {
        heading: "Lake Nasser",
        body: "The temples now look out over Lake Nasser, formed behind the Aswan High Dam in the 1960s and one of the largest reservoirs in the world, stretching some 500 km into Sudan. Several other Nubian temples rescued from the rising water now stand on its shores and can be visited on lake cruises.",
      },
    ],
    facts: [
      "Getting there: About 280 km from Aswan — 3.5 hours by road, or a short flight",
      "Time needed: About 2 hours at the site",
    ],
    tips: ["Stay the night in Abu Simbel to see the temples in the early morning and at the evening sound and light show."],
  },
  philae: {
    chapters: [
      {
        heading: "Trajan's Kiosk",
        body: "The most photographed building at Philae is an unfinished, roofless pavilion of fourteen columns on the island's edge, known as Trajan's Kiosk. It was probably a monumental gateway for the sacred boat of Isis arriving by river, and its elegant silhouette has made it a symbol of Philae since the first travellers came.",
      },
      {
        heading: "Birthplace of Horus",
        body: "Behind the great pylons is the mammisi, or birth house, celebrating the birth of Horus, son of Isis. Its reliefs show Isis nursing the young god in the marshes — an image that spread across the Roman world with the cult of Isis.",
      },
    ],
    facts: ["Getting there: Motorboat from the Shellal marina, about 10 minutes", "Time needed: About 1.5 hours"],
    tips: ["The boat fare isn't included in the site ticket — agree it at the marina."],
  },
  "el-alamein-memorials": {
    chapters: [
      {
        heading: "Lightfoot and Supercharge",
        body: "The Second Battle of El-Alamein opened on the night of 23 October 1942 with Operation Lightfoot, when infantry and engineers cleared paths through deep minefields under a barrage from nearly 900 guns. After days of costly fighting, Operation Supercharge broke through in early November, and on 4 November Rommel began his retreat — defying Hitler's order to stand fast.",
      },
      {
        heading: "The Military Museum",
        body: "The El-Alamein Military Museum opened in 1956 and was renovated in 1992. Its halls cover the North African campaign from the viewpoint of each army, and outside stand tanks, guns and vehicles from the battle.",
      },
    ],
    facts: ["Getting there: About 1.5 hours from Alexandria", "Combine with: A beach stay at New Alamein or Marassi"],
    tips: ["The German and Italian memorials are a few kilometres west of the town — ask your driver to include them."],
  },
  alexandria: {
    chapters: [
      {
        heading: "Roman Alexandria",
        body: "In the 1960s, clearing a site for new buildings at Kom el-Dikka uncovered the only Roman theatre found in Egypt — a small auditorium of marble tiers — together with baths, lecture halls and villas with mosaic floors. It is one of the few places where the ancient city, buried beneath the modern one, can still be walked through.",
      },
      {
        heading: "The Corniche and Montaza",
        body: "The seafront Corniche curves for more than 15 kilometres around the Eastern Harbour. At its eastern end, the gardens of Montaza surround the palaces of the last royal family — the Salamlek of 1892 and the larger Haramlik, completed in 1932 — with beaches and palm-lined paths open to visitors.",
      },
    ],
    facts: ["Distance from Cairo: About 3 hours by road or train", "Time needed: A full day"],
    tips: ["Book a table for fresh fish on the Corniche — you usually choose it at the counter and pay by weight."],
  },
  "st-catherines-monastery": {
    chapters: [
      {
        heading: "Icons older than iconoclasm",
        body: "The monastery holds one of the world's greatest collections of icons, including some of the very few to survive from before the 8th century, when icons were destroyed across much of the Byzantine Empire. Its 6th-century Christ Pantocrator, painted in hot wax, is among the oldest known images of Christ as ruler of the world. The apse of the basilica keeps a 6th-century mosaic of the Transfiguration.",
      },
      {
        heading: "Protected by many rulers",
        body: "According to the monks' tradition, the Prophet Muhammad granted the monastery a charter of protection, the Achtiname; the monastery holds a copy of it. Over the centuries it was also protected by Fatimid, Mamluk and Ottoman rulers, and the small Fatimid-era mosque inside the walls was built for the monastery's Muslim guards and the Bedouin who served it.",
      },
    ],
    facts: ["Getting there: About 2.5 hours by road from Sharm El Sheikh or Dahab", "Time needed: About 1 hour inside"],
    tips: ["Check opening days in advance — the monastery closes on Fridays, Sundays and religious holidays."],
  },
  "mount-sinai": {
    chapters: [
      {
        heading: "Elijah's Basin",
        body: "Just below the summit, where the Camel Path and the Steps of Repentance meet, lies a small plateau known as Elijah's Basin, with a lone cypress tree and a chapel dedicated to the prophet Elijah, who, tradition says, sheltered on the mountain. It's the last resting point before the final 750 steps to the top.",
      },
      {
        heading: "The mountains around",
        body: "Mount Sinai is part of a high granite massif. Mount Catherine next door is Egypt's highest peak, and the valleys between shelter Bedouin orchards and gardens irrigated by mountain springs. Several-day walking routes such as the Sinai Trail, created by Bedouin tribes, lead through them with local guides and camels.",
      },
    ],
    facts: ["Temperature at dawn: Near or below freezing in winter; cool even in summer", "Blankets and tea: For hire at the summit huts"],
    tips: ["Wear proper shoes with grip — the Steps of Repentance are uneven and steep on the way down."],
  },
  "ras-mohammed": {
    chapters: [
      {
        heading: "The famous dive sites",
        body: "Shark Reef and Yolanda Reef form a single spectacular wall dive at the very tip of the peninsula, where the reef drops hundreds of metres into the blue. Other favourites are Anemone City, a pinnacle carpeted with anemones and clownfish, and Jackfish Alley, a sandy channel between coral walls. Snorkellers see much of the same life in the shallows.",
      },
      {
        heading: "A protected coast",
        body: "The park protects both land and sea: fishing and collecting are forbidden, and the number of boats and moorings is controlled. Its mangroves are among the most northerly in the world, and ospreys and herons nest along the shore.",
      },
    ],
    facts: ["Getting there: About 45 minutes by road from Sharm El Sheikh, or by boat", "Entry: National park fee, collected at the gate"],
    tips: ["Book a boat trip for the best reefs — the beaches are good, but the famous walls are reached by sea."],
  },
  "blue-hole-dahab": {
    chapters: [
      {
        heading: "Ras Abu Galum",
        body: "North of the Blue Hole the road ends, and the coast becomes the Ras Abu Galum protected area, reached on foot, by camel or by boat. A few Bedouin camps serve fish and tea on empty beaches with some of the least-visited reefs in Sinai.",
      },
      {
        heading: "Diving it safely",
        body: "For recreational divers the safe route is a shallow swim from 'the Bells' along the reef wall into the Blue Hole, staying within normal recreational limits. The Arch lies far deeper than these limits, and should only be attempted by trained technical divers with the right equipment and gas.",
      },
    ],
    facts: ["Getting there: 15 minutes by car from Dahab", "Facilities: Cafés, gear rental and changing areas at the entry point"],
    tips: ["Go in the morning, before the tour buses from Sharm arrive."],
  },
}

/** A starter site with its extra chapters, facts and tips added. */
export function withDetails(site: StarterSite): StarterSite {
  const details = SITE_DETAILS[site.slug]
  if (!details) return site
  const extra = details.chapters.map((c) => `## ${c.heading}\n\n${c.body}`).join("\n\n")
  return {
    ...site,
    history: extra ? `${site.history}\n\n${extra}` : site.history,
    facts: [...site.facts, ...details.facts],
    tips: [...site.tips, ...details.tips],
  }
}

/** The starter sites with their extra detail — what fresh databases get. */
export const HISTORIC_SITES: StarterSite[] = STARTER_SITES.map(withDetails)
