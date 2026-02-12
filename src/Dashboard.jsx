import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { BookOpen, Calendar, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Compass, Edit3, Feather, Filter, Home, Layers, Library, MapPin, Search, Sparkles, Star, Clock, Archive, Scissors, Flame, Eye, Globe, Heart, Moon, Sun, Zap, Coffee, X, Check, Plus, ArrowRight, Cloud, CloudOff } from "lucide-react";
import { cloudEnabled, loadCloud, saveCloud } from "./sync.js";

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

const ARCS = [
  { id: 0, name: "The Spindle and the Story", short: "Spindle & Story", question: "Why do textiles and narrative keep showing up in the same breath?", color: "indigo", icon: "✦" },
  { id: 1, name: "Monsters of Place", short: "Monsters of Place", question: "What do local legends tell us about how we inhabit landscape?", color: "emerald", icon: "◆" },
  { id: 2, name: "The Workshop and the World", short: "Workshop & World", question: "What does it mean to make things by hand in an era of infinite automated production?", color: "amber", icon: "◈" },
  { id: 3, name: "Worldbuilding Is Real", short: "Worldbuilding", question: "How do the techniques of fiction worldbuilding apply to the actual worlds we construct?", color: "violet", icon: "◇" },
  { id: 4, name: "Reading as Making", short: "Reading as Making", question: "Is reading a passive act, or is it its own form of construction?", color: "rose", icon: "○" },
  { id: 5, name: "Dressed for the End of the World", short: "End of the World", question: "What do apocalypse stories tell us about what we think civilization actually is?", color: "red", icon: "△" },
  { id: 6, name: "The Body Knows", short: "The Body Knows", question: "What kinds of knowledge live in the body rather than the mind?", color: "teal", icon: "▽" },
  { id: 7, name: "Small Gods and Local Saints", short: "Small Gods", question: "How do communities create and maintain their own sacred figures?", color: "orange", icon: "□" },
  { id: 8, name: "Cross-Arc", short: "Quick Hits", question: "Shorter pieces that bridge arcs and provide breathing room.", color: "stone", icon: "·" },
];

const ARC_COLORS = {
  indigo: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", dot: "bg-indigo-400", light: "bg-indigo-100", ring: "ring-indigo-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400", light: "bg-emerald-100", ring: "ring-emerald-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-400", light: "bg-amber-100", ring: "ring-amber-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-400", light: "bg-violet-100", ring: "ring-violet-200" },
  rose: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-400", light: "bg-rose-100", ring: "ring-rose-200" },
  red: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-400", light: "bg-red-100", ring: "ring-red-200" },
  teal: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", dot: "bg-teal-400", light: "bg-teal-100", ring: "ring-teal-200" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-400", light: "bg-orange-100", ring: "ring-orange-200" },
  stone: { bg: "bg-stone-50", text: "text-stone-600", border: "border-stone-200", dot: "bg-stone-400", light: "bg-stone-100", ring: "ring-stone-200" },
};

const STATUSES = [
  { id: "spark", label: "Spark", emoji: "✧", color: "text-stone-500", bg: "bg-stone-100", border: "border-stone-200" },
  { id: "outlined", label: "Outlined", emoji: "◎", color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200" },
  { id: "drafting", label: "Drafting", emoji: "✎", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  { id: "editing", label: "Editing", emoji: "◉", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
  { id: "ready", label: "Ready", emoji: "✦", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { id: "published", label: "Published", emoji: "◆", color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
];

const INITIAL_ESSAYS = [
  // Arc 0: The Spindle and the Story
  { id: 1, title: "Text/ile", arc: 0, status: "spark", desc: "Trace the shared root of 'text' and 'textile' through Latin — both are technologies of pattern-making that impose order on raw material.", note: "Best deployed once readers trust the newsletter's range. Aim for issue 6–10.", pairWith: "Bayeux Tapestry online viewer; Poetic Edda on the Norns" },
  { id: 2, title: "The Valkyries' Loom", arc: 0, status: "spark", desc: "The Darraðarljóð describes valkyries weaving on a loom strung with human intestines. Weaving in mythology is almost never domestic — it's cosmic and fate-altering.", pairWith: "Image of a warp-weighted loom; The Craft of Zeus by Scheid & Svenbro" },
  { id: 3, title: "Sleeping Beauty's Spindle", arc: 0, status: "spark", desc: "The spinning wheel in fairy tales — how textile tools became symbols of female power so threatening they had to be enchanted or cursed.", pairWith: "Hunterian Psalter illumination of Eve spinning; Les Évangiles des Quenouilles" },
  { id: 4, title: "Penelope's Trick", arc: 0, status: "spark", desc: "Penelope's weaving-and-unweaving pauses the story itself. The Lakota buffalo robe analogy — making as temporal resistance.", pairWith: "Syriskos stamnos at Art Institute of Chicago; Women's Work by E.W. Barber" },
  { id: 5, title: "What the Monster Wears", arc: 0, status: "spark", desc: "The textile dimension of monster stories: selkie skins, werewolf belts, Bigfoot's fur. Cryptids as stories about being un-clothed and un-woven from civilization." },
  { id: 6, title: "Binary, Before Binary", arc: 0, status: "spark", desc: "The Jacquard loom and the Inca khipu — weaving as humanity's first information technology, predating digital computing by millennia.", pairWith: "New Scientist on khipu; The Fabric of Civilization by Postrel" },
  { id: 7, title: "The Shroud as Story", arc: 0, status: "spark", desc: "Burial textiles as narrative objects — Egyptian mummy wrappings, medieval embroidered shrouds, Navajo blankets with intentional flaws for the spirit to escape." },
  { id: 8, title: "Stitching Testimony", arc: 0, status: "spark", desc: "Chilean arpilleras documenting disappearances, Hmong story cloths recording refugee journeys, the AIDS Quilt. When writing is dangerous, textiles become testimony." },
  { id: 9, title: "Unraveling", arc: 0, status: "spark", desc: "The creative and political act of undoing textile work — Penelope, Torah burial traditions, frogging vintage garments, potlatch destruction." },
  { id: 10, title: "The Color That Doesn't Exist", arc: 0, status: "spark", desc: "Tyrian purple and the impossibility of seeing ancient colors as they were. Textiles encode sensory information that decays." },
  { id: 11, title: "String Theory", arc: 0, status: "spark", desc: "Cat's cradle as a global storytelling technology — in Inuit, Navajo, Japanese, and Pacific cultures, string figures are narrative devices, not games." },
  { id: 12, title: "Samplers and Sentences", arc: 0, status: "spark", desc: "Needlework samplers as literacy tools — simultaneously textile objects, literary texts, and autobiographies." },
  { id: 13, title: "The Dropped Stitch", arc: 0, status: "spark", desc: "Deliberate flaws in Amish quilts, Navajo weaving, and Persian rugs. Intentional imperfection as design philosophy in an era of algorithmic polish." },
  { id: 14, title: "Spider Silk", arc: 0, status: "spark", desc: "Material science meets mythology: Anansi, Arachne, Spider Woman. The spider as the original maker who builds from their own body." },
  { id: 15, title: "Invisible Mending", arc: 0, status: "spark", desc: "Kintsugi, European invisible reweaving, sashiko and boro — repair as creative act and the ethics of showing vs. hiding the fix." },
  { id: 16, title: "Thread Count", arc: 0, status: "spark", desc: "An ordinary medieval shirt required 20 miles of hand-spun thread. The hidden labor embedded in textiles, made invisible by industrial production." },

  // Arc 1: Monsters of Place
  { id: 17, title: "The Map Is Not the Monster", arc: 1, status: "spark", desc: "How cryptid legends function as folk cartography — every sighting report is a place description that marks the landscape with meaning." },
  { id: 18, title: "Mothman and the Ruins", arc: 1, status: "spark", desc: "The Mothman appeared near a decommissioned WWII munitions site. Monsters emerge in landscapes between states — former industrial sites, edges of towns." },
  { id: 19, title: "The Rougarou's Bayou", arc: 1, status: "spark", desc: "The Loup-garou tied to the swamp — a landscape that is itself neither land nor water. How the legend evolves as the bayous change." },
  { id: 20, title: "Designing the Unseen", arc: 1, status: "spark", desc: "How people design their monsters — from woodcut sea serpents to contemporary creature concept art. Visual conventions for depicting the never-seen." },
  { id: 21, title: "Knitting the Mothman", arc: 1, status: "spark", desc: "The cottage industry of cryptid craft — knitted Bigfoot dolls, embroidered Mothman patches. When the monster enters the domestic sphere." },
  { id: 22, title: "My Hometown Monster", arc: 1, status: "spark", desc: "A personal essay about discovering the legends attached to a landscape you know well. Potential reader contribution issue." },
  { id: 23, title: "Lake Monsters and the Depths", arc: 1, status: "spark", desc: "From Nessie to Champ to Ogopogo — why lakes? Proximity plus opacity equals dread. The psychological geometry of the lake monster." },
  { id: 24, title: "The Chupacabra's Migration", arc: 1, status: "spark", desc: "First Puerto Rico (1995), then Mexico, then Texas — a real-time case study in how folklore variant chains work, just faster." },
  { id: 25, title: "Fairy Paths and Monster Roads", arc: 1, status: "spark", desc: "Irish fairy paths, Chinese feng shui spirit roads, Aboriginal songlines — invisible routes that constrain the physical built environment." },
  { id: 26, title: "The Flatwoods Monster and the Cold War", arc: 1, status: "spark", desc: "A hovering, metallic creature in 1952 West Virginia — the monsters of a specific era embody that era's specific fears." },
  { id: 27, title: "Thresholds", arc: 1, status: "spark", desc: "Monsters at bridges, crossroads, cave mouths, forest edges, twilight. Liminality as inherently monstrous. Threshold ecology of the uncanny." },
  { id: 28, title: "The Skinwalker and Sovereignty", arc: 1, status: "spark", desc: "Cultural ownership of monsters — the ethics of cryptid tourism and the difference between living cultural practice and entertainment content." },
  { id: 29, title: "Phantom Cats", arc: 1, status: "spark", desc: "The UK's persistent 'alien big cats' — a wish for wildness in a country that eliminated its megafauna centuries ago." },
  { id: 30, title: "The Fouke Monster", arc: 1, status: "spark", desc: "How The Legend of Boggy Creek (1972) changed a town, a legend, and the relationship between the two." },
  { id: 31, title: "Sea Serpents and Cartographic Anxiety", arc: 1, status: "spark", desc: "Medieval maps placed serpents at the edges of known waters. As cartography improved, the serpents retreated. Does knowing a place kill its monsters?" },
  { id: 32, title: "Night Sounds", arc: 1, status: "spark", desc: "Many cryptid encounters are auditory — the Grassman's howl, the Ozark Howler. How soundscapes generate monsters where vision cannot." },

  // Arc 2: The Workshop and the World
  { id: 33, title: "In Praise of the Loom", arc: 2, status: "spark", desc: "Why handwork matters — not Luddite, but a genuine inquiry into knowledge that lives in the hands." },
  { id: 34, title: "The Luddite Stitch", arc: 2, status: "spark", desc: "The Luddites were skilled weavers who objected to machines devaluing their craft. What they got right and wrong about technology." },
  { id: 35, title: "A Pattern Language", arc: 2, status: "spark", desc: "Craft traditions encode knowledge in patterns that carry information across generations without requiring literacy." },
  { id: 36, title: "Making Time", arc: 2, status: "spark", desc: "A sweater takes 40–80 hours. What changes in our relationship to objects when visual art and text can be generated in seconds?" },
  { id: 37, title: "The Zine and the Spindle", arc: 2, status: "spark", desc: "DIY publishing as craft tradition — from 1930s fanzines to Riot Grrrl to risograph. Both zines and handspinning insist on the presence of the maker." },
  { id: 38, title: "The Muscle Memory Essays", arc: 2, status: "spark", desc: "A weaver, a blacksmith, a calligrapher on what they know in their bodies that they cannot articulate. Knowledge that exists only in practice." },
  { id: 39, title: "Wabi-Sabi and the Algorithm", arc: 2, status: "spark", desc: "Japanese aesthetics of imperfection versus AI's trend toward frictionless polish. Two competing aesthetics revealing their makers." },
  { id: 40, title: "The Repair Economy", arc: 2, status: "spark", desc: "Visible mending, Repair Cafés, Right to Repair — a counter-economy built around fixing things, rooted in textile repair traditions." },
  { id: 41, title: "Tools of the Trade", arc: 2, status: "spark", desc: "Drop spindle, knitting needle, heddle, shuttle — each tool encodes centuries of ergonomic refinement. Intelligence embedded in hand tools." },
  { id: 42, title: "Ghost Labor", arc: 2, status: "spark", desc: "Every machine-made textile contains the ghost of the handwork it replaced. Is AI-generated text similarly haunted by the writing it was trained on?" },
  { id: 43, title: "The Slow Movement, Revisited", arc: 2, status: "spark", desc: "Is slowness the point, or is it a proxy for attention, care, presence? Interrogating the slow movement's assumptions." },
  { id: 44, title: "Grandmother's Hands", arc: 2, status: "spark", desc: "Personal essay — inherited craft knowledge passed through demonstration. What do you know how to make because someone showed you?" },

  // Arc 3: Worldbuilding Is Real
  { id: 45, title: "The God Problem", arc: 3, status: "spark", desc: "Fiction worldbuilders are omniscient; real civilizations are built by millions making small decisions. What each can learn from the other." },
  { id: 46, title: "Maps and Territories", arc: 3, status: "spark", desc: "Tolkien's maps, medieval mappa mundi, silk road charts — mapmaking as worldbuilding. What a map leaves out shapes the world it describes." },
  { id: 47, title: "Cloth as Currency", arc: 3, status: "spark", desc: "Bolts of cloth as money — durable, portable, self-regulating. How textile-as-currency shaped trade networks. Worldbuilding at its most material." },
  { id: 48, title: "The Invented Folklore", arc: 3, status: "spark", desc: "Tolkien invented songs and proverbs. But real folklore was also once new. The blurry line between 'authentic' and 'invented' tradition." },
  { id: 49, title: "Designing Belief", arc: 3, status: "spark", desc: "How worldbuilders create folk practices that feel real — drawing on textile superstitions to explore how cultural worldbuilding works." },
  { id: 50, title: "The Economy of Imaginary Worlds", arc: 3, status: "spark", desc: "Why economic worldbuilding matters — real textile economies as models for how trade shapes civilization in fiction." },
  { id: 51, title: "Conlangs and Weaving Drafts", arc: 3, status: "spark", desc: "Constructed languages and weaving drafts are both notation systems for generating complex patterns from simple rules." },
  { id: 52, title: "The Unreliable Atlas", arc: 3, status: "spark", desc: "Maps lie — in fiction and reality. How cartographic choices construct the worlds they claim to merely describe." },
  { id: 53, title: "Founding Myths", arc: 3, status: "spark", desc: "Every nation has a partly fabricated founding myth. National mythology as designed artifact — what fiction writers can learn." },
  { id: 54, title: "Heraldry as Design System", arc: 3, status: "spark", desc: "Heraldic blazonry as a rigorous visual language encoding family history and aspiration. Humanity's oldest design system." },
  { id: 55, title: "The Tavern Problem", arc: 3, status: "spark", desc: "Why does every fantasy world have taverns? Unconscious cultural assumptions in worldbuilding — coffeehouses, bathhouses, textile workshops." },
  { id: 56, title: "Calendar Systems", arc: 3, status: "spark", desc: "Inventing a calendar determines how a culture experiences time. The French Revolutionary Calendar, the Maya Long Count." },

  // Arc 4: Reading as Making
  { id: 57, title: "The Commonplace Book", arc: 4, status: "spark", desc: "The original 'curated newsletter' — copying passages into personal notebooks, organized by theme. A deeply physical, handmade practice." },
  { id: 58, title: "Marginalia as Conversation", arc: 4, status: "spark", desc: "Medieval manuscripts full of annotations and arguments conducted across centuries. Reading was never passive — always a form of making." },
  { id: 59, title: "The Publishing of Small Things", arc: 4, status: "spark", desc: "Small presses, chapbooks, letterpress — the material culture of independent publishing. What a handmade book does that a PDF cannot." },
  { id: 60, title: "The Scriptoria", arc: 4, status: "spark", desc: "Monastery copying rooms where every element of the book was handmade from raw materials. The book as handmade object." },
  { id: 61, title: "The Lending Library", arc: 4, status: "spark", desc: "18th-century circulating libraries as social infrastructure — reading as communal practice, progressively privatized." },
  { id: 62, title: "Fan Fiction as Worldbuilding", arc: 4, status: "spark", desc: "Unauthorized collaborative worldbuilding at massive scale — a craft tradition with conventions, apprenticeship, and guild-like structures." },
  { id: 63, title: "Burning the Library", arc: 4, status: "spark", desc: "Biblioclasm as destruction of craft as much as text — each destroyed manuscript represented weeks of skilled labor." },
  { id: 64, title: "Reading Aloud", arc: 4, status: "spark", desc: "Silent reading is historically recent. What changes when reading moves from mouth to eye, group to individual? Audiobooks as return to the older mode." },
  { id: 65, title: "The Unfinished Book", arc: 4, status: "spark", desc: "Calvino, Chaucer, Kafka — incompleteness as feature. The dropped stitch in literary form." },

  // Arc 5: Dressed for the End of the World
  { id: 66, title: "What Would You Weave?", arc: 5, status: "spark", desc: "If civilization collapsed, where would you start rebuilding textile production? How much embodied knowledge have we outsourced?" },
  { id: 67, title: "The Prepper's Library", arc: 5, status: "spark", desc: "Survivalist bookshelves as worldbuilding manuals for post-collapse civilization. What the stockpile reveals about the vision." },
  { id: 68, title: "Costume and Collapse", arc: 5, status: "spark", desc: "Mad Max leather, The Road's ash-gray rags, Handmaid's red cloaks — costume designers building fallen worlds through cloth." },
  { id: 69, title: "The Long Now", arc: 5, status: "spark", desc: "The Long Now Foundation's 10,000-year clock vs. actual textile fragments from ancient Egypt. The hand-knitted sweater will outlast the cloud." },
  { id: 70, title: "After the Algorithm", arc: 5, status: "spark", desc: "The fragility of digital culture and the unexpected resilience of physical making. What happens if the internet goes down permanently?" },

  // Arc 6: The Body Knows
  { id: 71, title: "Thinking Through Making", arc: 6, status: "spark", desc: "Extended cognition — a potter 'thinks' through clay, a weaver through thread. What this means for claims that AI replicates creativity." },
  { id: 72, title: "The Knitter's Trance", arc: 6, status: "spark", desc: "Repetitive handwork induces meditative states — EEG studies on knitting. Craft as contemplative technology from rosary beads to spinning." },
  { id: 73, title: "Folk Medicine and Fiber", arc: 6, status: "spark", desc: "Cobwebs pressed into wounds, lanolin as skin treatment, linen bandages with honey — the overlap between textile and medical toolkits." },
  { id: 74, title: "Dance as Worldbuilding", arc: 6, status: "spark", desc: "Traditional dances encode spatial knowledge — Morris dancing maps village geography, Aboriginal dances trace songlines." },
  { id: 75, title: "The Shape of the Hand", arc: 6, status: "spark", desc: "Human hands evolved for making — the fine motor tasks of processing fiber, shaping clay, knapping stone. We're designed to make things." },

  // Arc 7: Small Gods and Local Saints
  { id: 76, title: "Roadside Shrines", arc: 7, status: "spark", desc: "From Guadalupe grottos to Buddhist spirit houses — handmade, site-specific folk architecture. The shrine as smallest unit of worldbuilding." },
  { id: 77, title: "Patron Saints of Unlikely Things", arc: 7, status: "spark", desc: "St. Isidore (internet), St. Drogo (unattractive people) — the patron saint system as a vast collaborative worldbuilding project." },
  { id: 78, title: "The Tulpa and the Egregore", arc: 7, status: "spark", desc: "Beings created by focused thought. The boundary between imagining a being and creating one — and what that means for fiction writers." },
  { id: 79, title: "Festival Time", arc: 7, status: "spark", desc: "Special clothing, food, stories, suspended rules — the festival as the most concentrated form of communal worldbuilding." },
  { id: 80, title: "House Spirits", arc: 7, status: "spark", desc: "Domovoi, tomte, zashiki-warashi, brownies — domestic folklore as worldbuilding at the scale of a single building." },

  // Arc 8: Cross-Arc Quick Hits
  { id: 81, title: "The Wikipedia Rabbit Hole", arc: 8, status: "spark", desc: "The internet as loom — start with one thread and end up with a fabric you didn't plan. Personal essay on research as weaving." },
  { id: 82, title: "Things I've Made Badly", arc: 8, status: "spark", desc: "A list essay about failed projects. The scarf that curled, the story that collapsed. Failure as knowledge." },
  { id: 83, title: "Monster Season", arc: 8, status: "spark", desc: "Why cryptid sightings cluster in certain months — Mothman in November, Bigfoot in summer. The seasonality of the uncanny." },
  { id: 84, title: "The Haunted Object", arc: 8, status: "spark", desc: "The Hope Diamond, Robert the Doll, the Dybbuk Box. What makes us believe certain made things contain a presence?" },
  { id: 85, title: "A Glossary Entry", arc: 8, status: "spark", desc: "Template: a single word — 'Warp,' 'Uncanny,' 'Pattern,' 'Threshold' — defined through etymology and association. Micro-essay format." },
  { id: 86, title: "Postcards from the Archive", arc: 8, status: "spark", desc: "Template: a single image from a museum or archive, with annotation. Low effort, high texture." },
  { id: 87, title: "Correspondent's Report", arc: 8, status: "spark", desc: "Template: reader-contributed essays — local monster stories, craft traditions, unexpected connections. Lightens your load." },
];

const BOOKS = [
  { id: 1, title: "Women's Work: The First 20,000 Years", author: "Elizabeth Wayland Barber", cat: "Textiles", note: "The foundational text. Start here." },
  { id: 2, title: "The Fabric of Civilization", author: "Virginia Postrel", cat: "Textiles", note: "Textiles drove technology, banking, chemistry, and computing." },
  { id: 3, title: "The Golden Thread", author: "Kassia St Clair", cat: "Textiles", note: "Narrative-driven. Good model for essay structure." },
  { id: 4, title: "The Craft of Zeus", author: "Scheid & Svenbro", cat: "Textiles", note: "Weaving myths in Greek and Indo-European culture." },
  { id: 5, title: "Spiders and Spinsters", author: "Marta Weigle", cat: "Textiles", note: "Catalog of spinning/weaving goddesses and folk beliefs." },
  { id: 6, title: "On Weaving", author: "Anni Albers", cat: "Textiles", note: "Bauhaus weaver's meditation on craft. Beautiful and philosophical." },
  { id: 7, title: "Worn: A People's History of Clothing", author: "Sofi Thanhauser", cat: "Textiles", note: "Recent, readable, political." },
  { id: 8, title: "Indigo: Egyptian Mummies to Blue Jeans", author: "Jenny Balfour-Paul", cat: "Textiles", note: "Single-dye history spanning civilizations." },
  { id: 9, title: "The Book of Imaginary Beings", author: "Jorge Luis Borges", cat: "Folklore", note: "Master catalog of invented and legendary creatures." },
  { id: 10, title: "No Go the Bogeyman", author: "Marina Warner", cat: "Folklore", note: "Cultural history of ogres and fear figures." },
  { id: 11, title: "The Night Battles", author: "Carlo Ginzburg", cat: "Folklore", note: "Masterwork of microhistory on folk belief." },
  { id: 12, title: "Daimonic Reality", author: "Patrick Harpur", cat: "Folklore", note: "Anomalous phenomena as expressions of the 'imaginal' world." },
  { id: 13, title: "Troublesome Things", author: "Diane Purkiss", cat: "Folklore", note: "Academic fairy history that's genuinely enjoyable." },
  { id: 14, title: "Drakon", author: "Daniel Ogden", cat: "Folklore", note: "History of the dragon in classical antiquity." },
  { id: 15, title: "A Pattern Language", author: "Christopher Alexander", cat: "Worldbuilding", note: "Secretly about how all complex systems encode knowledge in patterns." },
  { id: 16, title: "The Language of the Night", author: "Ursula K. Le Guin", cat: "Worldbuilding", note: "On worldbuilding, myth, and the social function of fantasy." },
  { id: 17, title: "On Fairy-Stories", author: "J.R.R. Tolkien", cat: "Worldbuilding", note: "Foundational essay on sub-creation and secondary belief." },
  { id: 18, title: "Six Memos for the Next Millennium", author: "Italo Calvino", cat: "Worldbuilding", note: "Philosophical companion to the whole project." },
  { id: 19, title: "Seeing Like a State", author: "James C. Scott", cat: "Worldbuilding", note: "How large-scale planning fails when it ignores local knowledge." },
  { id: 20, title: "A History of Reading", author: "Alberto Manguel", cat: "Books", note: "Definitive cultural history of reading as practice." },
  { id: 21, title: "How the Page Matters", author: "Bonnie Mak", cat: "Books", note: "Brief, brilliant study of the physical page as technology." },
  { id: 22, title: "Notes from Underground: Zines", author: "Stephen Duncombe", cat: "Books", note: "Definitive cultural history of zines." },
  { id: 23, title: "The Craftsman", author: "Richard Sennett", cat: "Unexpected", note: "Philosophical argument for skilled manual labor." },
  { id: 24, title: "The Old Ways", author: "Robert Macfarlane", cat: "Unexpected", note: "Walking ancient paths. Feeds Monsters of Place beautifully." },
  { id: 25, title: "A Field Guide to Getting Lost", author: "Rebecca Solnit", cat: "Unexpected", note: "Tonal model for the kind of writing you might do." },
  { id: 26, title: "Lines: A Brief History", author: "Tim Ingold", cat: "Unexpected", note: "Lines drawn, written, woven, walked — a single framework." },
  { id: 27, title: "The Disappearance of Rituals", author: "Byung-Chul Han", cat: "Unexpected", note: "What we lose when repetitive practices are replaced by novelty." },
  { id: 28, title: "When Old Technologies Were New", author: "Carolyn Marvin", cat: "Unexpected", note: "Every 'new technology' panic has a precedent." },
];

const QUOTES = [
  { text: "Both weaving and writing are technologies of pattern-making — both impose order on raw material, both encode meaning in structure.", source: "Materia" },
  { text: "The loom is a technology of creation on the largest possible scale.", source: "Materia" },
  { text: "You're not just writing a newsletter. You're building a body of work.", source: "Materia" },
  { text: "A biweekly newsletter that readers look forward to is worth infinitely more than a weekly one that feels like homework.", source: "Materia" },
  { text: "Every myth was once a new story.", source: "Materia" },
  { text: "Start as a human being with an obsession.", source: "Materia" },
  { text: "Consistency matters more than frequency.", source: "Materia" },
  { text: "Let it give you ambition.", source: "Materia" },
];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

/* ─── Persistence helpers ─── */
const STORAGE_KEY = "materia-dashboard";

function loadSaved(key, fallback) {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${key}`);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveTo(key, value) {
  try { localStorage.setItem(`${STORAGE_KEY}:${key}`, JSON.stringify(value)); } catch {}
}

export default function MateriaDashboard() {
  const [view, setView] = useState("overview");
  const [essays, setEssays] = useState(() => loadSaved("essays", INITIAL_ESSAYS));
  const [arcFilter, setArcFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [calMonth, setCalMonth] = useState(new Date(2026, 2, 1)); // March 2026
  const [expandedEssay, setExpandedEssay] = useState(null);
  const [currentReading, setCurrentReading] = useState("");
  const [currentMaking, setCurrentMaking] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [scheduledEssays, setScheduledEssays] = useState(() => loadSaved("scheduledEssays", {}));
  const [composeEssayId, setComposeEssayId] = useState(null);
  const [composeDrafts, setComposeDrafts] = useState(() => loadSaved("composeDrafts", {}));

  // Notebook: running log of "Currently" entries + freeform notes
  const [notebookLog, setNotebookLog] = useState(() => loadSaved("notebookLog", []));
  const [notebookNotes, setNotebookNotes] = useState(() => loadSaved("notebookNotes", []));

  // ─── Sync: localStorage (instant) + cloud (debounced) ───
  const [cloudStatus, setCloudStatus] = useState(cloudEnabled ? "idle" : "off"); // "off" | "idle" | "saving" | "saved" | "error"
  const saveTimer = useRef(null);
  const initialLoadDone = useRef(false);

  // Gather all persistable state into one object
  const gatherState = useCallback(() => ({
    essays, scheduledEssays, composeDrafts, notebookLog, notebookNotes,
  }), [essays, scheduledEssays, composeDrafts, notebookLog, notebookNotes]);

  // On mount: load from cloud (if available) and hydrate
  useEffect(() => {
    if (!cloudEnabled) { initialLoadDone.current = true; return; }
    loadCloud().then(cloud => {
      if (cloud) {
        // Cloud data exists — use it (it's the cross-device truth)
        if (cloud.essays) setEssays(cloud.essays);
        if (cloud.scheduledEssays) setScheduledEssays(cloud.scheduledEssays);
        if (cloud.composeDrafts) setComposeDrafts(cloud.composeDrafts);
        if (cloud.notebookLog) setNotebookLog(cloud.notebookLog);
        if (cloud.notebookNotes) setNotebookNotes(cloud.notebookNotes);
        // Also update localStorage to match
        saveTo("essays", cloud.essays || INITIAL_ESSAYS);
        saveTo("scheduledEssays", cloud.scheduledEssays || {});
        saveTo("composeDrafts", cloud.composeDrafts || {});
        saveTo("notebookLog", cloud.notebookLog || []);
        saveTo("notebookNotes", cloud.notebookNotes || []);
      }
      initialLoadDone.current = true;
      setCloudStatus("idle");
    });
  }, []);

  // Auto-save: localStorage immediately, cloud with debounce
  useEffect(() => {
    if (!initialLoadDone.current) return; // don't save during initial hydration
    saveTo("essays", essays);
    saveTo("scheduledEssays", scheduledEssays);
    saveTo("composeDrafts", composeDrafts);
    saveTo("notebookLog", notebookLog);
    saveTo("notebookNotes", notebookNotes);

    if (cloudEnabled) {
      setCloudStatus("saving");
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveCloud({ essays, scheduledEssays, composeDrafts, notebookLog, notebookNotes })
          .then(() => setCloudStatus("saved"))
          .catch(() => setCloudStatus("error"));
      }, 1500); // wait 1.5s of inactivity before saving to cloud
    }
  }, [essays, scheduledEssays, composeDrafts, notebookLog, notebookNotes]);

  const [nbFilter, setNbFilter] = useState("all");  // 'all' | 'reading' | 'making' | 'idea'
  const [nbNoteText, setNbNoteText] = useState("");
  const [nbNoteTag, setNbNoteTag] = useState("idea");
  const [nbNoteArc, setNbNoteArc] = useState(null);
  const [nbNoteEssay, setNbNoteEssay] = useState(null);

  const saveCurrently = () => {
    const now = new Date().toISOString();
    const newEntries = [];
    if (currentReading.trim()) {
      newEntries.push({ id: Date.now(), type: "reading", text: currentReading.trim(), date: now });
    }
    if (currentMaking.trim()) {
      newEntries.push({ id: Date.now() + 1, type: "making", text: currentMaking.trim(), date: now });
    }
    if (newEntries.length > 0) {
      setNotebookLog(prev => [...newEntries, ...prev]);
      setCurrentReading("");
      setCurrentMaking("");
    }
  };

  const addNote = () => {
    if (!nbNoteText.trim()) return;
    const note = {
      id: Date.now(),
      text: nbNoteText.trim(),
      date: new Date().toISOString(),
      tag: nbNoteTag,
      arcId: nbNoteArc,
      essayId: nbNoteEssay,
    };
    setNotebookNotes(prev => [note, ...prev]);
    setNbNoteText("");
    setNbNoteEssay(null);
  };

  const deleteNote = (id) => {
    setNotebookNotes(prev => prev.filter(n => n.id !== id));
  };

  const allNotebookItems = useMemo(() => {
    const items = [
      ...notebookLog.map(e => ({ ...e, kind: "log" })),
      ...notebookNotes.map(n => ({ ...n, kind: "note" })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (nbFilter === "all") return items;
    return items.filter(item => {
      if (item.kind === "log") return item.type === nbFilter;
      return item.tag === nbFilter;
    });
  }, [notebookLog, notebookNotes, nbFilter]);

  const statusCounts = useMemo(() => {
    const counts = {};
    STATUSES.forEach(s => { counts[s.id] = essays.filter(e => e.status === s.id).length; });
    return counts;
  }, [essays]);

  const arcCounts = useMemo(() => {
    const counts = {};
    ARCS.forEach(a => {
      const arcEssays = essays.filter(e => e.arc === a.id);
      counts[a.id] = {
        total: arcEssays.length,
        published: arcEssays.filter(e => e.status === "published").length,
        inProgress: arcEssays.filter(e => ["outlined", "drafting", "editing"].includes(e.status)).length,
      };
    });
    return counts;
  }, [essays]);

  const cycleStatus = (essayId) => {
    const order = STATUSES.map(s => s.id);
    setEssays(prev => prev.map(e => {
      if (e.id !== essayId) return e;
      const idx = order.indexOf(e.status);
      return { ...e, status: order[(idx + 1) % order.length] };
    }));
  };

  const filteredEssays = useMemo(() => {
    return essays.filter(e => {
      const matchesArc = arcFilter === null || e.arc === arcFilter;
      const matchesSearch = !searchTerm || e.title.toLowerCase().includes(searchTerm.toLowerCase()) || e.desc.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesArc && matchesSearch;
    });
  }, [essays, arcFilter, searchTerm]);

  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  /* ─── Calendar helpers ─── */
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const biweeklyDates = useMemo(() => {
    const dates = [];
    let d = new Date(2026, 2, 1);
    for (let i = 0; i < 52; i++) {
      dates.push(new Date(d));
      d = new Date(d.getTime() + 14 * 24 * 60 * 60 * 1000);
    }
    return dates;
  }, []);

  const isPublishDate = (day) => {
    return biweeklyDates.some(d =>
      d.getFullYear() === calMonth.getFullYear() &&
      d.getMonth() === calMonth.getMonth() &&
      d.getDate() === day
    );
  };

  const getPublishNumber = (day) => {
    const target = new Date(calMonth.getFullYear(), calMonth.getMonth(), day);
    const idx = biweeklyDates.findIndex(d =>
      d.getFullYear() === target.getFullYear() &&
      d.getMonth() === target.getMonth() &&
      d.getDate() === target.getDate()
    );
    return idx >= 0 ? idx + 1 : null;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  const mono = "'Courier New', Courier, monospace";
  const serif = "'Georgia', 'Times New Roman', serif";
  const label = { fontFamily: mono, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" };

  return (
    <div className="flex h-screen" style={{ background: "#FDFCFA", fontFamily: serif }}>

      {/* ─── SIDEBAR ─── */}
      <div className={`${sidebarOpen ? "w-64" : "w-0 overflow-hidden"} transition-all duration-300 flex-shrink-0 flex flex-col`} style={{ background: "#F5F3EF", borderRight: "1px solid #E0DDD8" }}>
        <div className="p-6 pb-5">
          <h1 className="text-lg tracking-wide" style={{ fontFamily: mono, fontWeight: 400, color: "#1C1917" }}>Materia</h1>
          <p className="mt-1" style={{ ...label, color: "#A8A29E", fontSize: "9px" }}>A bestiary of made things</p>
        </div>

        <nav className="px-4 mb-5">
          {[
            { id: "overview", label: "Overview", icon: <Home size={14} /> },
            { id: "compose", label: "Compose", icon: <Feather size={14} /> },
            { id: "pipeline", label: "Pipeline", icon: <Layers size={14} /> },
            { id: "ideas", label: "Idea Bank", icon: <Sparkles size={14} /> },
            { id: "calendar", label: "Calendar", icon: <Calendar size={14} /> },
            { id: "library", label: "Library", icon: <BookOpen size={14} /> },
            { id: "notebook", label: "Notebook", icon: <Edit3 size={14} /> },
          ].map(item => (
            <button key={item.id} onClick={() => { setView(item.id); setArcFilter(null); setSearchTerm(""); }}
              className="w-full flex items-center gap-3 px-2 py-2 text-left transition-all"
              style={{ fontFamily: mono, fontSize: "12px", color: view === item.id ? "#1C1917" : "#A8A29E", fontWeight: view === item.id ? 700 : 400, borderLeft: view === item.id ? "2px solid #1C1917" : "2px solid transparent" }}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-4 mb-2">
          <div style={{ borderTop: "1px solid #E0DDD8", paddingTop: "12px" }}>
            <p style={{ ...label, color: "#A8A29E", paddingLeft: "8px", marginBottom: "8px", fontSize: "9px" }}>Arcs</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {ARCS.map(arc => {
            const c = arcCounts[arc.id];
            const isActive = arcFilter === arc.id && view === "ideas";
            return (
              <button key={arc.id} onClick={() => { setView("ideas"); setArcFilter(arc.id); }}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-left transition-all"
                style={{ fontFamily: mono, fontSize: "11px", color: isActive ? "#1C1917" : "#A8A29E", fontWeight: isActive ? 700 : 400 }}>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ARC_COLORS[arc.color].dot}`}></span>
                <span className="truncate flex-1">{arc.short}</span>
                <span style={{ fontSize: "10px", color: "#C4C0BB" }}>{c?.total || 0}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4" style={{ borderTop: "1px solid #E0DDD8", fontFamily: mono }}>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#1C1917" }}>{essays.length}</div>
              <div style={{ ...label, color: "#C4C0BB", fontSize: "8px" }}>ideas</div>
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#92713A" }}>{statusCounts.drafting + statusCounts.editing + statusCounts.outlined}</div>
              <div style={{ ...label, color: "#C4C0BB", fontSize: "8px" }}>active</div>
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#1C1917" }}>{statusCounts.published}</div>
              <div style={{ ...label, color: "#C4C0BB", fontSize: "8px" }}>sent</div>
            </div>
          </div>
          {/* Cloud sync indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-3 pt-2" style={{ borderTop: "1px solid #E0DDD8" }}>
            {cloudStatus === "off" ? (
              <><CloudOff size={10} style={{ color: "#C4C0BB" }} /><span style={{ fontSize: "9px", color: "#C4C0BB" }}>local only</span></>
            ) : cloudStatus === "saving" ? (
              <><Cloud size={10} style={{ color: "#A8A29E" }} /><span style={{ fontSize: "9px", color: "#A8A29E" }}>syncing...</span></>
            ) : cloudStatus === "saved" ? (
              <><Cloud size={10} style={{ color: "#92713A" }} /><span style={{ fontSize: "9px", color: "#92713A" }}>synced</span></>
            ) : cloudStatus === "error" ? (
              <><CloudOff size={10} style={{ color: "#B45309" }} /><span style={{ fontSize: "9px", color: "#B45309" }}>sync error</span></>
            ) : (
              <><Cloud size={10} style={{ color: "#C4C0BB" }} /><span style={{ fontSize: "9px", color: "#C4C0BB" }}>cloud</span></>
            )}
          </div>
        </div>
      </div>

      {/* ─── MAIN AREA ─── */}
      <div className="flex-1 overflow-y-auto">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 z-50 w-7 h-7 flex items-center justify-center transition-colors"
          style={{ left: sidebarOpen ? "calc(16rem + 12px)" : "12px", background: "transparent", color: "#A8A29E" }}>
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="max-w-3xl mx-auto px-8 py-10">

          {/* ════════ OVERVIEW ════════ */}
          {view === "overview" && (
            <div>
              <div className="mb-10">
                <h2 className="text-xl mb-3" style={{ fontFamily: mono, fontWeight: 400, color: "#1C1917" }}>Good morning, Sarah.</h2>
                <p className="italic text-sm leading-relaxed" style={{ color: "#A8A29E", maxWidth: "30rem" }}>"{quote.text}"</p>
              </div>

              {/* Materia conceit */}
              <div className="mb-10 p-5" style={{ border: "1px solid #E0DDD8", maxWidth: "34rem" }}>
                <h3 className="mb-2" style={{ fontFamily: mono, fontSize: "12px", color: "#1C1917" }}>What is <em style={{ fontFamily: serif }}>Materia</em>?</h3>
                <p className="text-xs leading-relaxed mb-4" style={{ color: "#78716C" }}>
                  Each issue is an entry in an ongoing catalog of the stuff the world is made from — thread, landscape, monsters, stories, belief, tools, pattern, place. Like a <em>materia medica</em> describes a substance and its properties, each entry examines one material, creature, place, practice, or pattern and explores what it's made of and what it means.
                </p>
                <div className="grid grid-cols-5 gap-3 pt-4" style={{ borderTop: "1px solid #E0DDD8" }}>
                  {[
                    { label: "Specimen", desc: "Opening image" },
                    { label: "Entry", desc: "The essay" },
                    { label: "Connections", desc: "Curated links" },
                    { label: "Practice", desc: "What you're making" },
                    { label: "Annotation", desc: "Closing line" },
                  ].map((s, i) => (
                    <div key={i} className="text-center">
                      <div style={{ ...label, color: "#1C1917", fontSize: "9px" }}>{s.label}</div>
                      <div style={{ fontSize: "9px", color: "#A8A29E", fontFamily: mono }}>{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-6 mb-10" style={{ maxWidth: "34rem" }}>
                {[
                  { label: "Sparks", value: statusCounts.spark },
                  { label: "Active", value: statusCounts.outlined + statusCounts.drafting + statusCounts.editing },
                  { label: "Ready", value: statusCounts.ready },
                  { label: "Published", value: statusCounts.published },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: mono, fontSize: "28px", fontWeight: 400, color: "#1C1917" }}>{s.value}</div>
                    <div style={{ ...label, color: "#A8A29E", fontSize: "9px" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Currently */}
              <div className="mb-10 p-5" style={{ border: "1px solid #E0DDD8", maxWidth: "34rem" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 style={{ ...label, color: "#A8A29E" }}>Currently</h3>
                  {(currentReading.trim() || currentMaking.trim()) && (
                    <button onClick={saveCurrently}
                      className="flex items-center gap-1.5 px-2 py-1 transition-all"
                      style={{ fontFamily: mono, fontSize: "10px", color: "#92713A", border: "1px solid #E0DDD8" }}>
                      <Check size={10} />
                      Save to notebook
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1" style={{ ...label, color: "#C4C0BB", fontSize: "9px" }}>Reading</label>
                    <input type="text" value={currentReading} onChange={e => setCurrentReading(e.target.value)}
                      placeholder="What are you reading right now?"
                      className="w-full text-sm pb-1 bg-transparent focus:outline-none transition-colors"
                      style={{ color: "#1C1917", borderBottom: "1px solid #E0DDD8", fontFamily: serif }} />
                  </div>
                  <div>
                    <label className="block mb-1" style={{ ...label, color: "#C4C0BB", fontSize: "9px" }}>Making</label>
                    <input type="text" value={currentMaking} onChange={e => setCurrentMaking(e.target.value)}
                      placeholder="What are you making with your hands?"
                      className="w-full text-sm pb-1 bg-transparent focus:outline-none transition-colors"
                      style={{ color: "#1C1917", borderBottom: "1px solid #E0DDD8", fontFamily: serif }} />
                  </div>
                </div>
                {notebookLog.length > 0 && (
                  <div className="mt-4 pt-3" style={{ borderTop: "1px solid #E0DDD8" }}>
                    <button onClick={() => setView("notebook")}
                      className="flex items-center gap-1.5 transition-all"
                      style={{ fontFamily: mono, fontSize: "10px", color: "#A8A29E" }}>
                      <Archive size={10} />
                      {notebookLog.length} saved {notebookLog.length === 1 ? "entry" : "entries"} in notebook →
                    </button>
                  </div>
                )}
              </div>

              {/* Arc Progress */}
              <div className="p-5" style={{ border: "1px solid #E0DDD8", maxWidth: "34rem" }}>
                <h3 className="mb-4" style={{ ...label, color: "#A8A29E" }}>Arc Progress</h3>
                <div className="space-y-3">
                  {ARCS.map(arc => {
                    const c = arcCounts[arc.id];
                    if (!c) return null;
                    const progressPct = c.total > 0 ? (c.published / c.total) * 100 : 0;
                    const activePct = c.total > 0 ? (c.inProgress / c.total) * 100 : 0;
                    return (
                      <div key={arc.id} className="flex items-center gap-3">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ARC_COLORS[arc.color].dot}`}></span>
                        <span className="w-28 truncate" style={{ fontFamily: mono, fontSize: "11px", color: "#78716C" }}>{arc.short}</span>
                        <div className="flex-1 h-1 overflow-hidden" style={{ background: "#EDEAE6" }}>
                          <div className="h-full transition-all duration-500" style={{
                            width: `${progressPct + activePct}%`,
                            background: "#1C1917"
                          }}></div>
                        </div>
                        <span style={{ fontFamily: mono, fontSize: "10px", color: "#C4C0BB" }}>{c.published}/{c.total}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ════════ COMPOSE ════════ */}
          {view === "compose" && (() => {
            const draft = composeEssayId ? (composeDrafts[composeEssayId] || { specimen: "", entry: "", connections: "", practice: "", annotation: "" }) : null;
            const updateDraft = (field, value) => {
              setComposeDrafts(prev => ({ ...prev, [composeEssayId]: { ...(prev[composeEssayId] || { specimen: "", entry: "", connections: "", practice: "", annotation: "" }), [field]: value } }));
            };
            const selectedEssay = composeEssayId ? essays.find(e => e.id === composeEssayId) : null;
            const wordCount = draft ? (draft.entry || "").trim().split(/\s+/).filter(Boolean).length : 0;
            const inputStyle = { fontFamily: serif, fontSize: "14px", color: "#1C1917", background: "transparent", border: "none", borderBottom: "1px solid #E0DDD8", width: "100%", padding: "8px 0", outline: "none" };
            const textareaStyle = { fontFamily: serif, fontSize: "14px", color: "#1C1917", background: "transparent", border: "1px solid #E0DDD8", width: "100%", padding: "12px", outline: "none", resize: "none" };

            return (
              <div>
                <h2 className="mb-8" style={{ fontFamily: mono, fontSize: "20px", fontWeight: 400, color: "#1C1917" }}>Compose</h2>

                {/* Structural guide */}
                <div className="mb-8 p-4" style={{ border: "1px solid #E0DDD8" }}>
                  <p className="text-xs leading-relaxed" style={{ color: "#78716C" }}>
                    Each issue of <em style={{ fontFamily: serif }}>Materia</em> is an entry in an ongoing catalog. One material, creature, place, practice, or pattern — examined for its properties, habitat, and meaning.
                  </p>
                </div>

                {/* Essay selector */}
                <div className="mb-8">
                  <label className="block mb-2" style={{ ...label, color: "#A8A29E" }}>Select an entry to draft</label>
                  <select value={composeEssayId || ""} onChange={e => setComposeEssayId(Number(e.target.value) || null)}
                    className="w-full p-3 text-sm bg-white focus:outline-none cursor-pointer"
                    style={{ fontFamily: mono, fontSize: "12px", color: "#1C1917", border: "1px solid #E0DDD8" }}>
                    <option value="">Choose an essay...</option>
                    {essays.map(essay => {
                      const arc = ARCS[essay.arc];
                      return <option key={essay.id} value={essay.id}>{essay.title} — {arc.short}</option>;
                    })}
                  </select>
                </div>

                {/* Template sections */}
                {selectedEssay && (() => {
                  const arc = ARCS[selectedEssay.arc];
                  const ac = ARC_COLORS[arc.color];
                  return (
                    <div>
                      {/* Essay info */}
                      <div className="mb-8 pb-6" style={{ borderBottom: "1px solid #E0DDD8" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${ac.dot}`}></span>
                          <span style={{ fontFamily: mono, fontSize: "11px", color: "#A8A29E" }}>{arc.name}</span>
                        </div>
                        <h3 className="text-lg mb-2" style={{ fontFamily: serif, color: "#1C1917" }}>{selectedEssay.title}</h3>
                        <p className="text-xs leading-relaxed" style={{ color: "#78716C" }}>{selectedEssay.desc}</p>
                        {selectedEssay.pairWith && <p className="text-xs mt-2" style={{ color: "#A8A29E" }}><span style={{ fontFamily: mono, fontSize: "10px" }}>PAIR WITH:</span> {selectedEssay.pairWith}</p>}
                      </div>

                      <div className="space-y-8">
                        {/* The Specimen */}
                        <div>
                          <h4 className="mb-1" style={{ ...label, color: "#1C1917" }}>The Specimen</h4>
                          <p className="text-xs mb-3" style={{ color: "#A8A29E" }}>What image, object, or artifact anchors this entry?</p>
                          <textarea value={draft.specimen} onChange={e => updateDraft("specimen", e.target.value)}
                            placeholder="Describe or note your opening image..."
                            rows={3} style={textareaStyle} />
                        </div>

                        {/* The Entry */}
                        <div>
                          <div className="flex items-baseline justify-between mb-1">
                            <h4 style={{ ...label, color: "#1C1917" }}>The Entry</h4>
                            <span style={{ fontFamily: mono, fontSize: "11px", color: wordCount >= 800 && wordCount <= 1500 ? "#1C1917" : "#C4C0BB" }}>
                              {wordCount} <span style={{ color: "#C4C0BB" }}>/ 800–1,500</span>
                            </span>
                          </div>
                          <p className="text-xs mb-3" style={{ color: "#A8A29E" }}>The heart of the entry. One idea, examined.</p>
                          <textarea value={draft.entry} onChange={e => updateDraft("entry", e.target.value)}
                            placeholder="Begin your entry..."
                            rows={24} style={{ ...textareaStyle, resize: "vertical", lineHeight: "1.8" }} />
                          <div className="mt-2 h-px overflow-hidden" style={{ background: "#EDEAE6" }}>
                            <div className="h-full transition-all duration-300" style={{
                              width: `${Math.min((wordCount / 1500) * 100, 100)}%`,
                              background: "#1C1917"
                            }}></div>
                          </div>
                        </div>

                        {/* The Connections */}
                        <div>
                          <h4 className="mb-1" style={{ ...label, color: "#1C1917" }}>The Connections</h4>
                          <p className="text-xs mb-3" style={{ color: "#A8A29E" }}>3–5 curated links with 1–2 sentence annotations.</p>
                          <textarea value={draft.connections} onChange={e => updateDraft("connections", e.target.value)}
                            placeholder={"1. [Title](url) — Why this belongs.\n2. [Title](url) — The connection.\n3. [Title](url) — What this adds."}
                            rows={7} style={textareaStyle} />
                        </div>

                        {/* The Practice */}
                        <div>
                          <h4 className="mb-1" style={{ ...label, color: "#1C1917" }}>The Practice</h4>
                          <p className="text-xs mb-3" style={{ color: "#A8A29E" }}>What you're making, reading, working on. Keep it honest.</p>
                          <textarea value={draft.practice} onChange={e => updateDraft("practice", e.target.value)}
                            placeholder="What you're making with your hands..."
                            rows={3} style={textareaStyle} />
                        </div>

                        {/* The Annotation */}
                        <div>
                          <h4 className="mb-1" style={{ ...label, color: "#1C1917" }}>The Annotation</h4>
                          <p className="text-xs mb-3" style={{ color: "#A8A29E" }}>A closing line. Something that lingers.</p>
                          <textarea value={draft.annotation} onChange={e => updateDraft("annotation", e.target.value)}
                            placeholder="The last thing the reader carries..."
                            rows={2} style={textareaStyle} />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {!composeEssayId && (
                  <div className="text-center py-16">
                    <p style={{ fontFamily: mono, fontSize: "12px", color: "#C4C0BB" }}>Select an entry above to begin.</p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ════════ PIPELINE ════════ */}
          {view === "pipeline" && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl" style={{ fontFamily: mono, fontWeight: 400, color: "#1C1917" }}>Pipeline</h2>
                <span style={{ ...label, color: "#C4C0BB", fontSize: "9px" }}>click to advance →</span>
              </div>

              {/* Status summary */}
              <div className="flex flex-wrap gap-4 mb-8">
                {STATUSES.map(s => (
                  <span key={s.id} className="inline-flex items-center gap-1.5" style={{ fontFamily: mono, fontSize: "11px", color: "#78716C" }}>
                    <span>{s.emoji}</span>
                    <span>{s.label}</span>
                    <span style={{ color: "#1C1917", fontWeight: 700 }}>{statusCounts[s.id]}</span>
                  </span>
                ))}
              </div>

              {/* Arc filter */}
              <div className="flex flex-wrap gap-1.5 mb-8">
                <button onClick={() => setArcFilter(null)}
                  className="px-2.5 py-1 text-xs transition-all"
                  style={{ fontFamily: mono, fontSize: "11px", color: arcFilter === null ? "#1C1917" : "#A8A29E", fontWeight: arcFilter === null ? 700 : 400, borderBottom: arcFilter === null ? "1px solid #1C1917" : "1px solid transparent" }}>
                  All arcs
                </button>
                {ARCS.map(arc => (
                  <button key={arc.id} onClick={() => setArcFilter(arcFilter === arc.id ? null : arc.id)}
                    className="px-2.5 py-1 text-xs transition-all flex items-center gap-1.5"
                    style={{ fontFamily: mono, fontSize: "11px", color: arcFilter === arc.id ? "#1C1917" : "#A8A29E", fontWeight: arcFilter === arc.id ? 700 : 400, borderBottom: arcFilter === arc.id ? "1px solid #1C1917" : "1px solid transparent" }}>
                    <span className={`w-1.5 h-1.5 rounded-full ${ARC_COLORS[arc.color].dot}`}></span>
                    {arc.short}
                  </button>
                ))}
              </div>

              {/* Pipeline columns */}
              <div className="grid grid-cols-3 gap-6">
                {STATUSES.filter(s => s.id !== "spark").map(status => {
                  const statusEssays = filteredEssays.filter(e => e.status === status.id);
                  return (
                    <div key={status.id} className="min-h-32">
                      <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: "1px solid #E0DDD8" }}>
                        <span style={{ fontFamily: mono, fontSize: "11px", color: "#78716C" }}>{status.emoji}</span>
                        <span style={{ ...label, color: "#78716C", fontSize: "10px" }}>{status.label}</span>
                        <span className="ml-auto" style={{ fontFamily: mono, fontSize: "11px", color: "#C4C0BB" }}>{statusEssays.length}</span>
                      </div>
                      <div className="space-y-2">
                        {statusEssays.map(essay => {
                          const arc = ARCS[essay.arc];
                          const ac = ARC_COLORS[arc.color];
                          return (
                            <div key={essay.id} onClick={() => cycleStatus(essay.id)}
                              className="p-3 transition-all cursor-pointer group"
                              style={{ border: "1px solid #E0DDD8", background: "#FDFCFA" }}>
                              <div className="flex items-start gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${ac.dot}`}></span>
                                <div className="flex-1 min-w-0">
                                  <h4 className="leading-snug" style={{ fontFamily: serif, fontSize: "12px", color: "#1C1917" }}>{essay.title}</h4>
                                  <p className="mt-1 truncate" style={{ fontFamily: mono, fontSize: "10px", color: "#A8A29E" }}>{arc.short}</p>
                                </div>
                                <ArrowRight size={12} className="flex-shrink-0 mt-0.5 transition-colors" style={{ color: "#C4C0BB" }} />
                              </div>
                            </div>
                          );
                        })}
                        {statusEssays.length === 0 && (
                          <p className="text-center py-4" style={{ fontFamily: mono, fontSize: "11px", color: "#C4C0BB", fontStyle: "italic" }}>Empty</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sparks section */}
              <div className="mt-10 pt-6" style={{ borderTop: "1px solid #E0DDD8" }}>
                <div className="flex items-center gap-2 mb-4">
                  <span style={{ color: "#A8A29E", fontSize: "13px" }}>✧</span>
                  <h3 style={{ fontFamily: mono, fontSize: "12px", color: "#78716C" }}>Sparks</h3>
                  <span style={{ fontFamily: mono, fontSize: "11px", color: "#C4C0BB" }}>· {filteredEssays.filter(e => e.status === "spark").length} ideas waiting</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {filteredEssays.filter(e => e.status === "spark").map(essay => {
                    const arc = ARCS[essay.arc];
                    const ac = ARC_COLORS[arc.color];
                    return (
                      <div key={essay.id} onClick={() => cycleStatus(essay.id)}
                        className="flex items-center gap-2 px-3 py-2 transition-all cursor-pointer group"
                        style={{ border: "1px solid #E0DDD8" }}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ac.dot}`}></span>
                        <span className="truncate flex-1" style={{ fontFamily: serif, fontSize: "12px", color: "#78716C" }}>{essay.title}</span>
                        <ArrowRight size={10} className="flex-shrink-0 transition-colors" style={{ color: "#C4C0BB" }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ════════ IDEA BANK ════════ */}
          {view === "ideas" && (
            <div>
              <div className="mb-2">
                <h2 className="text-xl" style={{ fontFamily: mono, fontWeight: 400, color: "#1C1917" }}>Idea Bank</h2>
              </div>
              {arcFilter !== null && (
                <div className="mb-4">
                  <p className="text-sm italic" style={{ color: "#A8A29E", fontFamily: serif }}>{ARCS[arcFilter].question}</p>
                </div>
              )}

              {/* Search */}
              <div className="relative mb-6" style={{ maxWidth: "24rem" }}>
                <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2" style={{ color: "#C4C0BB" }} />
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search essays..."
                  className="w-full pl-6 pr-8 py-2 text-sm bg-transparent focus:outline-none transition-colors"
                  style={{ fontFamily: mono, fontSize: "12px", color: "#1C1917", borderBottom: "1px solid #E0DDD8" }} />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-0 top-1/2 -translate-y-1/2" style={{ color: "#A8A29E" }}>
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Arc filter */}
              <div className="flex flex-wrap gap-1.5 mb-8">
                <button onClick={() => setArcFilter(null)}
                  className="px-2.5 py-1 text-xs transition-all"
                  style={{ fontFamily: mono, fontSize: "11px", color: arcFilter === null ? "#1C1917" : "#A8A29E", fontWeight: arcFilter === null ? 700 : 400, borderBottom: arcFilter === null ? "1px solid #1C1917" : "1px solid transparent" }}>
                  All ({essays.length})
                </button>
                {ARCS.map(arc => (
                  <button key={arc.id} onClick={() => setArcFilter(arcFilter === arc.id ? null : arc.id)}
                    className="px-2.5 py-1 text-xs transition-all flex items-center gap-1.5"
                    style={{ fontFamily: mono, fontSize: "11px", color: arcFilter === arc.id ? "#1C1917" : "#A8A29E", fontWeight: arcFilter === arc.id ? 700 : 400, borderBottom: arcFilter === arc.id ? "1px solid #1C1917" : "1px solid transparent" }}>
                    <span className={`w-1.5 h-1.5 rounded-full ${ARC_COLORS[arc.color].dot}`}></span>
                    {arc.short}
                  </button>
                ))}
              </div>

              {/* Essay cards */}
              <div className="space-y-2">
                {filteredEssays.map(essay => {
                  const arc = ARCS[essay.arc];
                  const ac = ARC_COLORS[arc.color];
                  const isExpanded = expandedEssay === essay.id;
                  const st = STATUSES.find(s => s.id === essay.status);
                  return (
                    <div key={essay.id} className="transition-all" style={{ border: "1px solid #E0DDD8", borderColor: isExpanded ? "#A8A29E" : "#E0DDD8" }}>
                      <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => setExpandedEssay(isExpanded ? null : essay.id)}>
                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${ac.dot}`}></span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm" style={{ fontFamily: serif, color: "#1C1917" }}>{essay.title}</h4>
                            <span className="inline-flex items-center gap-1" style={{ fontFamily: mono, fontSize: "10px", color: "#A8A29E" }}>
                              {st.emoji} {st.label}
                            </span>
                          </div>
                          <p className="mt-0.5" style={{ fontFamily: mono, fontSize: "10px", color: "#C4C0BB" }}>{arc.short}</p>
                          {!isExpanded && <p className="mt-1.5 line-clamp-2 leading-relaxed" style={{ fontSize: "12px", color: "#78716C" }}>{essay.desc}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isExpanded ? <ChevronUp size={14} style={{ color: "#A8A29E" }} /> : <ChevronDown size={14} style={{ color: "#C4C0BB" }} />}
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0">
                          <div className="ml-5 pl-4" style={{ borderLeft: "1px solid #E0DDD8" }}>
                            <p className="text-sm leading-relaxed mb-3" style={{ color: "#78716C" }}>{essay.desc}</p>
                            {essay.note && (
                              <p className="text-xs px-3 py-2 mb-3 leading-relaxed" style={{ color: "#92713A", background: "#F9F7F4", border: "1px solid #E0DDD8" }}>
                                <span style={{ fontFamily: mono, fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Note: </span>{essay.note}
                              </p>
                            )}
                            {essay.pairWith && (
                              <p className="text-xs mb-3" style={{ color: "#A8A29E" }}>
                                <span style={{ fontFamily: mono, fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#78716C" }}>Pair with: </span>{essay.pairWith}
                              </p>
                            )}
                            <div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid #E0DDD8" }}>
                              <span style={{ ...label, color: "#C4C0BB", fontSize: "9px" }}>Move to:</span>
                              {STATUSES.map(s => (
                                <button key={s.id}
                                  onClick={(e) => { e.stopPropagation(); setEssays(prev => prev.map(x => x.id === essay.id ? { ...x, status: s.id } : x)); }}
                                  className="px-2 py-1 text-xs transition-all"
                                  style={{ fontFamily: mono, fontSize: "10px", color: essay.status === s.id ? "#1C1917" : "#C4C0BB", fontWeight: essay.status === s.id ? 700 : 400, borderBottom: essay.status === s.id ? "1px solid #1C1917" : "1px solid transparent" }}>
                                  {s.emoji} {s.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {filteredEssays.length === 0 && (
                  <div className="text-center py-12">
                    <p style={{ fontFamily: mono, fontSize: "12px", color: "#C4C0BB" }}>No essays match your search.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════ CALENDAR ════════ */}
          {view === "calendar" && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl" style={{ fontFamily: mono, fontWeight: 400, color: "#1C1917" }}>Editorial Calendar</h2>
              </div>

              <p className="text-sm mb-8" style={{ color: "#A8A29E", fontFamily: mono, fontSize: "11px" }}>Biweekly rhythm starting March 1, 2026. Issue dates are marked.</p>

              {/* Month nav */}
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))}
                  className="w-7 h-7 flex items-center justify-center transition-colors"
                  style={{ border: "1px solid #E0DDD8", color: "#A8A29E" }}>
                  <ChevronLeft size={14} />
                </button>
                <h3 className="w-48 text-center" style={{ fontFamily: mono, fontSize: "14px", color: "#1C1917" }}>
                  {monthNames[calMonth.getMonth()]} {calMonth.getFullYear()}
                </h3>
                <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))}
                  className="w-7 h-7 flex items-center justify-center transition-colors"
                  style={{ border: "1px solid #E0DDD8", color: "#A8A29E" }}>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Calendar grid */}
              <div className="overflow-hidden" style={{ border: "1px solid #E0DDD8" }}>
                <div className="grid grid-cols-7" style={{ borderBottom: "1px solid #E0DDD8" }}>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                    <div key={d} className="p-3 text-center" style={{ ...label, color: "#A8A29E", fontSize: "9px" }}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {Array.from({ length: getFirstDayOfMonth(calMonth) }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-3 min-h-24" style={{ borderBottom: "1px solid #F0EEEB", borderRight: "1px solid #F0EEEB" }}></div>
                  ))}
                  {Array.from({ length: getDaysInMonth(calMonth) }).map((_, i) => {
                    const day = i + 1;
                    const isPub = isPublishDate(day);
                    const issueNum = getPublishNumber(day);
                    const dateKey = `${calMonth.getFullYear()}-${calMonth.getMonth()}-${day}`;
                    const scheduled = scheduledEssays[dateKey];
                    return (
                      <div key={day} className="p-2 min-h-24 transition-colors"
                        style={{ borderBottom: "1px solid #F0EEEB", borderRight: "1px solid #F0EEEB", background: isPub ? "#F9F7F4" : "transparent" }}>
                        <div className="flex items-center justify-between mb-1">
                          <span style={{ fontFamily: mono, fontSize: "11px", color: isPub ? "#1C1917" : "#C4C0BB", fontWeight: isPub ? 700 : 400 }}>{day}</span>
                          {isPub && (
                            <span style={{ fontFamily: mono, fontSize: "9px", color: "#92713A", fontWeight: 700 }}>
                              #{issueNum}
                            </span>
                          )}
                        </div>
                        {isPub && (
                          <div className="mt-1">
                            {scheduled ? (
                              <div className="truncate" style={{ fontFamily: serif, fontSize: "11px", color: "#1C1917", borderBottom: "1px solid #E0DDD8", paddingBottom: "2px" }}>{scheduled}</div>
                            ) : (
                              <select onChange={e => {
                                if (e.target.value) setScheduledEssays(prev => ({...prev, [dateKey]: e.target.value}));
                              }}
                                className="w-full bg-transparent focus:outline-none"
                                style={{ fontFamily: mono, fontSize: "10px", color: "#C4C0BB", border: "none", borderBottom: "1px dashed #E0DDD8", padding: "2px 0" }}
                                defaultValue="">
                                <option value="">assign...</option>
                                {essays.map(essay => (
                                  <option key={essay.id} value={essay.title}>{essay.title}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Suggested first 5 */}
              <div className="mt-10 p-5" style={{ border: "1px solid #E0DDD8" }}>
                <h3 className="mb-4" style={{ ...label, color: "#A8A29E" }}>Suggested First Five Issues</h3>
                <div className="space-y-3">
                  {[
                    { num: 1, title: "The First Monster I Made", note: "Set the tone: personal, curious, wide-ranging. Show readers who you are." },
                    { num: 2, title: "The Bestiary / What Holds", note: "Establish the newsletter's intellectual range." },
                    { num: 3, title: "The Map Is Not the Monster", note: "Surprise people early. Show this isn't just a craft newsletter." },
                    { num: 4, title: "In Praise of the Loom", note: "Introduce the handwork-vs-automation theme." },
                    { num: 5, title: "Sleeping Beauty's Spindle", note: "By now, readers trust your range. Your expertise lands as a gift." },
                  ].map(issue => (
                    <div key={issue.num} className="flex items-start gap-3">
                      <span className="flex-shrink-0" style={{ fontFamily: mono, fontSize: "14px", color: "#92713A", fontWeight: 700 }}>{issue.num}.</span>
                      <div>
                        <span className="text-sm" style={{ fontFamily: serif, color: "#1C1917" }}>{issue.title}</span>
                        <p className="mt-0.5" style={{ fontSize: "12px", color: "#A8A29E" }}>{issue.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════ LIBRARY ════════ */}
          {view === "library" && (
            <div>
              <div className="mb-8">
                <h2 className="text-xl" style={{ fontFamily: mono, fontWeight: 400, color: "#1C1917" }}>Library</h2>
              </div>

              {/* Reading list */}
              {["Textiles", "Folklore", "Worldbuilding", "Books", "Unexpected"].map(cat => {
                const catBooks = BOOKS.filter(b => b.cat === cat);
                if (catBooks.length === 0) return null;
                const catLabels = {
                  Textiles: "Textiles, Craft & Material Culture",
                  Folklore: "Folklore, Cryptids & the Strange",
                  Worldbuilding: "Worldbuilding, Fiction & Design",
                  Books: "Publishing, Reading & the Book",
                  Unexpected: "The Unexpected Shelf",
                };
                return (
                  <div key={cat} className="mb-10">
                    <h3 className="mb-3" style={{ ...label, color: "#A8A29E" }}>{catLabels[cat]}</h3>
                    <div className="space-y-0">
                      {catBooks.map(book => (
                        <div key={book.id} className="py-3 transition-all" style={{ borderBottom: "1px solid #F0EEEB" }}>
                          <div className="flex items-start gap-3">
                            <BookOpen size={13} className="mt-0.5 flex-shrink-0" style={{ color: "#C4C0BB" }} />
                            <div>
                              <h4 className="text-sm" style={{ fontFamily: serif, color: "#1C1917" }}>
                                <span style={{ fontWeight: 600 }}>{book.author}</span>, <em>{book.title}</em>
                              </h4>
                              <p className="mt-1" style={{ fontSize: "12px", color: "#A8A29E" }}>{book.note}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Podcasts */}
              <div className="mb-10">
                <h3 className="mb-3" style={{ ...label, color: "#A8A29E" }}>Podcasts</h3>
                <div className="grid grid-cols-2 gap-0">
                  {[
                    { name: "Lore", note: "Folklore, legend, and dark history" },
                    { name: "Ologies", note: "Niche disciplines — fiber science, cryptozoology, folk taxonomy" },
                    { name: "Weird Studies", note: "Philosophy meets the strange" },
                    { name: "The Allusionist", note: "Etymology and language history" },
                    { name: "Articles of Interest", note: "Clothing — from 99% Invisible" },
                    { name: "Fiber Nation", note: "Textile history deep dives" },
                  ].map((pod, i) => (
                    <div key={pod.name} className="p-3" style={{ borderBottom: "1px solid #F0EEEB", borderRight: i % 2 === 0 ? "1px solid #F0EEEB" : "none" }}>
                      <h4 style={{ fontFamily: mono, fontSize: "11px", color: "#1C1917" }}>{pod.name}</h4>
                      <p className="mt-0.5" style={{ fontSize: "11px", color: "#A8A29E" }}>{pod.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Digital Archives */}
              <div className="mb-10">
                <h3 className="mb-3" style={{ ...label, color: "#A8A29E" }}>Digital Archives</h3>
                <div className="grid grid-cols-2 gap-0">
                  {[
                    { name: "British Library Digitised Manuscripts", note: "Bestiaries, psalters, illuminated manuscripts" },
                    { name: "Aberdeen Bestiary", note: "Fully digitized medieval bestiary with commentary" },
                    { name: "BFRO", note: "Bigfoot sighting reports — folk cartography in action" },
                    { name: "V&A Textile Collection", note: "Thousands of digitized textile objects" },
                    { name: "Europeana", note: "Pan-European textile and manuscript collections" },
                    { name: "The Quilt Index", note: "Searchable database of American quilts" },
                    { name: "Sacred Texts Archive", note: "Public domain mythology and folklore" },
                    { name: "Cryptid Wiki", note: "Extensive catalog of global cryptids" },
                  ].map((arch, i) => (
                    <div key={arch.name} className="p-3" style={{ borderBottom: "1px solid #F0EEEB", borderRight: i % 2 === 0 ? "1px solid #F0EEEB" : "none" }}>
                      <h4 style={{ fontFamily: mono, fontSize: "11px", color: "#1C1917" }}>{arch.name}</h4>
                      <p className="mt-0.5" style={{ fontSize: "11px", color: "#A8A29E" }}>{arch.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Format template */}
              <div className="p-5" style={{ border: "1px solid #E0DDD8" }}>
                <h3 className="mb-4" style={{ ...label, color: "#A8A29E" }}>Entry Format</h3>
                <p className="text-xs mb-4" style={{ color: "#78716C" }}>Each issue of <em style={{ fontFamily: serif }}>Materia</em> is an entry in an ongoing catalog. The structure:</p>
                <div className="space-y-4">
                  {[
                    { icon: <Eye size={13} />, label: "The Specimen", desc: "An image, object, or artifact that anchors this entry — the thing the reader sees first." },
                    { icon: <Feather size={13} />, label: "The Entry", desc: "800–1,500 words. One material, creature, place, practice, or pattern — examined for its properties, habitat, and meaning." },
                    { icon: <Globe size={13} />, label: "The Connections", desc: "3–5 curated links extending the entry into other territory, each with a 1–2 sentence annotation." },
                    { icon: <Scissors size={13} />, label: "The Practice", desc: "What you're currently making, reading, or working on. The accountability mechanism." },
                    { icon: <Star size={13} />, label: "The Annotation", desc: "A closing line. A quote, a question, an image. Something that lingers after the entry is done." },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="mt-0.5" style={{ color: "#C4C0BB" }}>{item.icon}</span>
                      <div>
                        <span style={{ fontFamily: mono, fontSize: "11px", color: "#1C1917" }}>{item.label}</span>
                        <p style={{ fontSize: "12px", color: "#A8A29E", marginTop: "2px" }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════ NOTEBOOK ════════ */}
          {view === "notebook" && (
            <div>
              <div className="mb-8">
                <h2 className="text-xl" style={{ fontFamily: mono, fontWeight: 400, color: "#1C1917" }}>Notebook</h2>
                <p className="mt-1" style={{ fontSize: "12px", color: "#A8A29E" }}>A running log of what you're reading, making, and thinking about. Nothing gets lost.</p>
              </div>

              {/* Add a note */}
              <div className="mb-10 p-5" style={{ border: "1px solid #E0DDD8" }}>
                <h3 className="mb-4" style={{ ...label, color: "#A8A29E" }}>New Note</h3>
                <textarea value={nbNoteText} onChange={e => setNbNoteText(e.target.value)}
                  placeholder="A stray thought, a connection, something you saw..."
                  rows={3}
                  style={{ fontFamily: serif, fontSize: "14px", color: "#1C1917", background: "transparent", border: "1px solid #E0DDD8", width: "100%", padding: "12px", outline: "none", resize: "none" }} />

                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  {/* Tag selector */}
                  <div className="flex items-center gap-2">
                    <span style={{ ...label, color: "#C4C0BB", fontSize: "9px" }}>Tag:</span>
                    {["idea", "reading", "making"].map(tag => (
                      <button key={tag} onClick={() => setNbNoteTag(tag)}
                        className="px-2 py-1 transition-all"
                        style={{ fontFamily: mono, fontSize: "10px", color: nbNoteTag === tag ? "#1C1917" : "#C4C0BB", fontWeight: nbNoteTag === tag ? 700 : 400, borderBottom: nbNoteTag === tag ? "1px solid #1C1917" : "1px solid transparent" }}>
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* Arc selector */}
                  <div className="flex items-center gap-2">
                    <span style={{ ...label, color: "#C4C0BB", fontSize: "9px" }}>Arc:</span>
                    <select value={nbNoteArc === null ? "" : nbNoteArc} onChange={e => setNbNoteArc(e.target.value === "" ? null : Number(e.target.value))}
                      className="bg-transparent focus:outline-none"
                      style={{ fontFamily: mono, fontSize: "11px", color: "#78716C", border: "none", borderBottom: "1px solid #E0DDD8", padding: "2px 0" }}>
                      <option value="">none</option>
                      {ARCS.map(arc => (
                        <option key={arc.id} value={arc.id}>{arc.short}</option>
                      ))}
                    </select>
                  </div>

                  {/* Essay selector */}
                  <div className="flex items-center gap-2">
                    <span style={{ ...label, color: "#C4C0BB", fontSize: "9px" }}>Essay:</span>
                    <select value={nbNoteEssay === null ? "" : nbNoteEssay} onChange={e => setNbNoteEssay(e.target.value === "" ? null : Number(e.target.value))}
                      className="bg-transparent focus:outline-none"
                      style={{ fontFamily: mono, fontSize: "11px", color: "#78716C", border: "none", borderBottom: "1px solid #E0DDD8", padding: "2px 0", maxWidth: "200px" }}>
                      <option value="">none</option>
                      {(nbNoteArc !== null ? essays.filter(e => e.arc === nbNoteArc) : essays).map(essay => (
                        <option key={essay.id} value={essay.id}>{essay.title}</option>
                      ))}
                    </select>
                  </div>

                  <button onClick={addNote}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 transition-all"
                    style={{ fontFamily: mono, fontSize: "10px", color: nbNoteText.trim() ? "#1C1917" : "#C4C0BB", border: "1px solid #E0DDD8" }}>
                    <Plus size={10} />
                    Add
                  </button>
                </div>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-1 mb-6">
                {[
                  { id: "all", label: "All" },
                  { id: "reading", label: "Reading" },
                  { id: "making", label: "Making" },
                  { id: "idea", label: "Ideas" },
                ].map(f => (
                  <button key={f.id} onClick={() => setNbFilter(f.id)}
                    className="px-2.5 py-1 transition-all"
                    style={{ fontFamily: mono, fontSize: "11px", color: nbFilter === f.id ? "#1C1917" : "#A8A29E", fontWeight: nbFilter === f.id ? 700 : 400, borderBottom: nbFilter === f.id ? "1px solid #1C1917" : "1px solid transparent" }}>
                    {f.label}
                  </button>
                ))}
                <span className="ml-auto" style={{ fontFamily: mono, fontSize: "11px", color: "#C4C0BB" }}>
                  {allNotebookItems.length} {allNotebookItems.length === 1 ? "entry" : "entries"}
                </span>
              </div>

              {/* Timeline */}
              {allNotebookItems.length === 0 ? (
                <div className="text-center py-16">
                  <p style={{ fontFamily: mono, fontSize: "12px", color: "#C4C0BB" }}>
                    {nbFilter === "all" ? "Your notebook is empty. Save a \"Currently\" entry from Overview, or add a note above." : `No ${nbFilter} entries yet.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-0">
                  {allNotebookItems.map((item, idx) => {
                    const d = new Date(item.date);
                    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                    const isLog = item.kind === "log";
                    const typeLabel = isLog ? item.type : item.tag;
                    const linkedArc = !isLog && item.arcId !== null && item.arcId !== undefined ? ARCS[item.arcId] : null;
                    const linkedEssay = !isLog && item.essayId ? essays.find(e => e.id === item.essayId) : null;

                    // Show date header when date changes
                    const prevItem = idx > 0 ? allNotebookItems[idx - 1] : null;
                    const prevDateStr = prevItem ? new Date(prevItem.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;
                    const showDateHeader = dateStr !== prevDateStr;

                    return (
                      <div key={item.id}>
                        {showDateHeader && (
                          <div className="pt-6 pb-2" style={{ borderTop: idx > 0 ? "1px solid #E0DDD8" : "none" }}>
                            <span style={{ ...label, color: "#A8A29E", fontSize: "9px" }}>{dateStr}</span>
                          </div>
                        )}
                        <div className="flex gap-4 py-3 group">
                          {/* Time + type indicator */}
                          <div className="flex-shrink-0 w-20 text-right">
                            <span style={{ fontFamily: mono, fontSize: "10px", color: "#C4C0BB" }}>{timeStr}</span>
                            <div style={{ fontFamily: mono, fontSize: "9px", color: typeLabel === "reading" ? "#92713A" : typeLabel === "making" ? "#78716C" : "#A8A29E", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "2px" }}>
                              {typeLabel}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0" style={{ borderLeft: "1px solid #E0DDD8", paddingLeft: "16px" }}>
                            <p className="leading-relaxed" style={{ fontFamily: serif, fontSize: "13px", color: "#1C1917" }}>{item.text}</p>
                            {(linkedArc || linkedEssay) && (
                              <div className="flex items-center gap-2 mt-1.5">
                                {linkedArc && (
                                  <span className="flex items-center gap-1" style={{ fontFamily: mono, fontSize: "10px", color: "#A8A29E" }}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${ARC_COLORS[linkedArc.color].dot}`}></span>
                                    {linkedArc.short}
                                  </span>
                                )}
                                {linkedEssay && (
                                  <span style={{ fontFamily: mono, fontSize: "10px", color: "#C4C0BB" }}>→ {linkedEssay.title}</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Delete (notes only) */}
                          {!isLog && (
                            <button onClick={() => deleteNote(item.id)}
                              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: "#C4C0BB" }}>
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
