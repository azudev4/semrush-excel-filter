import type { InputHTMLAttributes } from 'react';

export const DEFAULT_STORES = [
  // Japanese & Korean Fashion
  'isetan', 'takashimaya', 'beams', 'united arrows', 'ships',
  'journal standard', 'nano universe', 'tomorrowland', 'beauty youth',
  'studious', 'urban research', 'comme des garcons', 'issey miyake',
  'musinsa', 'w concept', 'aland', 'style nanda', 'kolon',
  'beanpole', 'sjyp', 'wooyoungmi', '8seconds', 'beyond closet',
  'ader error', 'low classic', 'juun j', 'uniqlo', 'muji',
  
  // Indian Fashion
  'myntra', 'ajio', 'nykaa fashion', 'reliance trends', 'fabindia',
  'lifestyle', 'shoppers stop', 'pantaloons', 'max fashion', 'westside',
  'manyavar', 'w for woman', 'global desi', 'allen solly',
  'peter england', 'van heusen', 'louis philippe', 'raymond', 'blackberrys',
  
  // Middle Eastern Fashion
  'namshi', 'ounass', 'noon', 'the modist', 'boutique 1', 'sivvi',
  'symphony', 'splash', 'landmark group', 'babyshop', 'centrepoint',
  'paris gallery',
  
  // South American & African Fashion
  'renner', 'c&a brazil', 'riachuelo', 'falabella', 'ripley',
  'saga falabella', 'linio', 'dafiti', 'woolworths sa', 'foschini',
  'mr price', 'ackermans', 'pep', 'edgars', 'jet', 'zando', 'jumia',
  'superbalist',
  
  // Scandinavian Fashion
  'filippa k', 'tiger of sweden', 'samsoe samsoe', 'norse projects',
  'han kjobenhavn', 'wood wood', 'ganni', 'by malene birger',
  'nn07', 'selected homme', 'selected femme', 'j lindeberg',
  'acne studios', 'cos', 'arket', '& other stories',
  
  // Sustainable & Ethical Fashion
  'reformation', 'everlane', 'veja', 'girlfriend collective',
  'thought clothing', 'people tree', 'mud jeans', 'ninety percent',
  'outerknown', 'kotn', 'nagnata', 'mara hoffman',
  'mother of pearl', 'stella mccartney', 'patagonia',
  
  // Plus Size Fashion
  'eloquii', 'torrid', 'fashion to figure', 'universal standard',
  'dia & co', 'city chic', 'navabi', 'yours clothing', 'simply be',
  'ulla popken', 'woman within', 'onestopplus', 'lane bryant',
  'ashley stewart', 'avenue',
  
  // Athletic & Activewear
  'gymshark', 'ryderwear', 'fabletics', 'outdoor voices', 'vuori',
  'rhone', 'beyond yoga', 'pe nation', 'carbon38', 'varley',
  'nobull', 'ten thousand', 'alphalete', 'muscle nation', 'echt',
  'lululemon', 'sweaty betty', 'under armour', 'nike', 'adidas',
  
  // Denim Specialists
  'nudie jeans', 'g star raw', 'true religion', 'diesel', 'ag jeans',
  'frame denim', 'mavi', 'nydj', 'lucky brand', 'dl1961', 'paige',
  'joes jeans', 'citizens of humanity', '7 for all mankind',
  'hudson jeans', 'levis', 'wrangler', 'lee',
  
  // Footwear Retailers
  'aldo', 'dsw', 'famous footwear', 'payless', 'journeys', 'clarks',
  'steve madden', 'ecco', 'geox', 'blundstone', 'rm williams',
  'christian louboutin', 'manolo blahnik', 'stuart weitzman',
  'tamara mellon', 'jimmy choo', 'nicholas kirkwood', 'dr martens',
  'teva', 'ugg', 'cole haan', 'sperry', 'merrell', 'keen',
  'skechers', 'crocs', 'rothys',
  
  // Direct to Consumer Brands
  'warby parker', 'untuckit', 'third love', 'thirdlove', 'glossier',
  'away luggage', 'mejuri', 'cuyana', 'mgemi', 'ministry of supply',
  'wolf and shepherd', 'frank and oak', 'quince', 'buck mason',
  'italic', 'koio', 'taylor stitch', 'mizzen main', 'stance',
  
  // International Luxury Department Stores
  'holt renfrew', 'galeries lafayette', 'tsum', 'tsvetnoy', 'beymen',
  'sanahunt', 'skp beijing', 'shinsegae', 'hyundai department store',
  'lane crawford', 'harvey nichols', 'harrods', 'selfridges',
  'printemps', 'la rinascente', 'kadewe', 'el corte ingles',
  
  // French Luxury & Haute Couture
  'dior', 'christian dior', 'dior homme', 'hermes', 'ysl',
  'yves saint laurent', 'saint laurent paris', 'nina ricci',
  'worth', 'house of worth', 'vionnet', 'roland mouret',
  'stephane rolland', 'charvet', 'charvet place vendome',
  
  // French Contemporary & Premium
  'apc', 'a.p.c.', 'sandro', 'sandro paris', 'maje', 'the kooples',
  'isabel marant', 'kenzo', 'paule ka', 'cacharel', 'cerruti',
  'cerruti 1881', 'maison margiela', 'margiela', 'moncler',
  'anne fontaine', 'alain figaret', 'morgan', 'kookai',
  'marithe francois girbaud', 'girbaud',
  
  // French Casual & Sportswear
  'le coq sportif', 'aigle', 'airness', 'decathlon', 'salomon',
  'rossignol', 'skis rossignol', 'oxbow', 'venum', 'kickers',
  'promod', 'pimkie', 'camaieu', 'damart', 'montagut',
  'vilebrequin', 'guy cotten',
  
  // French Lingerie & Intimates
  'chantelle', 'groupe chantelle', 'lise charmel',
  'gerbe lingerie', 'irfe', 'jours apres lunes',
  
  // Major Global E-commerce & Marketplaces
  'zalando', 'asos', 'amazon', 'farfetch', 'mytheresa',
  'net-a-porter', 'matchesfashion', 'ssense', 'nordstrom', 'shopbop',
  'luisaviaroma', 'yoox', 'the outnet', 'alibaba', 'aliexpress',
  'ebay', 'walmart', 'target', 'macys', 'rakuten', 'wayfair',
  'etsy', 'zappos', 'shopee',
  
  // Global Fashion Brands
  'ralph lauren', 'polo ralph lauren', 'tommy hilfiger', 'calvin klein',
  'hugo boss', 'nike', 'adidas', 'puma', 'levis', 'gap',
  'banana republic', 'old navy', 'coach', 'michael kors', 'kate spade',
  'tory burch', 'marc jacobs', 'brooks brothers', 'lacoste',
  'timberland', 'under armour', 'columbia sportswear',
  'patagonia', 'vans', 'converse', 'tommy bahama', 'vineyard vines',
  'peter millar', 'southern tide', 'robert graham', 'greg norman',
  'greg norman collection',
  
  // US Department Stores & Major Retailers
  'nordstrom', 'nordstrom rack', 'bloomingdales', 'saks fifth avenue',
  'saks off 5th', 'neiman marcus', 'bergdorf goodman', 'dillards',
  'belk', 'kohls', 'jcpenney', 'macys', 'barneys', 'barneys new york',
  'lord taylor', 'boscovs', 'bon ton', 'carson pirie scott',
  'filenes', 'foleys', 'kaufmanns', 'lazarus', 'marshall field',
  
  // Fashion & Apparel Chains
  'abercrombie', 'abercrombie fitch', 'american eagle', 'aeropostale',
  'anthropologie', 'bcbg', 'bcbgmaxazria', 'bonobos', 'buckle',
  'charlotte russe', 'chicos', 'express', 'forever 21', 'free people',
  'guess', 'hot topic', 'j crew', 'jcrew', 'johnston murphy',
  'jos a bank', 'lane bryant', 'limited', 'lululemon', 'madewell',
  'new york company', 'ny&co', 'urban outfitters', 'uniqlo',
  'eddie bauer', 'eileen fisher', 'fashion nova', 'fredricks hollywood',
  
  // Classic & Business Wear
  'charles tyrwhitt', 'tm lewin', 'hawes curtis', 'brooks brothers',
  'paul fredrick', 'proper cloth', 'indochino',
  'suit supply', 'suitsupply', 'jos a bank', 'jos bank',
  'mens wearhouse', 'thomas pink', 'hickey freeman',
  
  // Western & Outdoor Specialty
  'ariat', 'boot barn', 'cavenders', 'sheplers',
  'country outfitter', 'tractor supply', 'atwoods',
  'murdochs', 'buckaroo western wear', 'western wear',
  'justin boots', 'lucchese', 'dan post', 'rocky boots',
  'rods western', 'pfi western', 'corral boots',
  
  // Sports & Outdoor Retailers
  'dicks sporting goods', 'dicks', 'academy sports',
  'big 5', 'dunhams', 'garts', 'oshmans', 'moosejaw',
  'rei', 'bass pro', 'cabelas', 'sportsmans warehouse',
  'outdoor research', 'marmot', 'campmor', 'fleet feet',
  
  // Specialty & Youth Fashion
  'alo yoga', 'american apparel', 'ashley stewart', 'avenue',
  'buffalo exchange', 'citi trends', 'duluth trading',
  'dressbarn', 'gilly hicks', 'johnny cupcakes', 'karmaloop', 
  'kith', 'life is good', 'lularoe', 'madhappy', 'noah', 'oaklandish',
  
  // Sports Team Stores
  'west ham', 'west ham united', 'whu', 'hammers shop',
  'manchester united', 'man utd', 'man united', 'mufc',
  'liverpool', 'lfc', 'arsenal', 'afc',
  'chelsea', 'cfc', 'manchester city', 'man city', 'mcfc',
  'tottenham', 'spurs', 'thfc',
  'everton', 'efc', 'newcastle united', 'nufc',
  'leeds united', 'lufc', 'aston villa', 'avfc',
  'kitbag', 'soccer store',
  
  // MLS Team Stores
  'los angeles fc', 'lafc', 'la galaxy', 'galaxy',
  'seattle sounders', 'sounders fc', 'portland timbers', 'timbers',
  'atlanta united', 'atlanta utd', 'new york city fc', 'nycfc',
  'new york red bulls', 'ny red bulls', 'toronto fc', 'tfc',
  'montreal cf', 'cf montreal', 'vancouver whitecaps', 'whitecaps fc',
  'orlando city', 'orlando city sc', 'inter miami', 'inter miami cf',
  'austin fc', 'fc cincinnati', 'columbus crew', 'fc dallas',
  'houston dynamo', 'sporting kansas city', 'sporting kc',
  'colorado rapids', 'real salt lake', 'rsl',
  'san jose earthquakes', 'quakes', 'nashville sc', 'nashville',
  'minnesota united', 'minnesota utd', 'philadelphia union',
  'dc united', 'new england revolution', 'chicago fire', 'cf97',
  
  // NFL Team Stores
  'kansas city chiefs', 'chiefs', 'san francisco 49ers', '49ers',
  'baltimore ravens', 'ravens', 'buffalo bills', 'bills',
  'cincinnati bengals', 'bengals', 'cleveland browns', 'browns',
  'houston texans', 'texans', 'jacksonville jaguars', 'jaguars',
  'indianapolis colts', 'colts', 'tennessee titans', 'titans',
  'los angeles chargers', 'la chargers', 'denver broncos', 'broncos',
  'las vegas raiders', 'raiders', 'new york giants', 'giants',
  'washington commanders', 'commanders', 'minnesota vikings', 'vikings',
  'detroit lions', 'lions', 'chicago bears', 'bears',
  'atlanta falcons', 'falcons', 'new orleans saints', 'saints',
  'tampa bay buccaneers', 'buccaneers', 'bucs',
  'carolina panthers', 'panthers', 'los angeles rams', 'la rams',
  'seattle seahawks', 'seahawks', 'arizona cardinals', 'cardinals',
  
  // Premier League Team Stores
  'manchester united', 'man utd', 'man united', 'mufc',
  'manchester city', 'man city', 'mcfc',
  'liverpool', 'lfc', 'chelsea', 'cfc',
  'arsenal', 'afc', 'tottenham', 'spurs', 'thfc',
  'west ham', 'west ham united', 'leicester city', 'lcfc',
  'southampton', 'saints', 'crystal palace', 'cpfc',
  'brighton', 'brighton hove', 'wolves', 'wolverhampton',
  'brentford', 'watford', 'burnley', 'norwich city',
  'fulham', 'sheffield united', 'blades',
  
  // European Football Team Stores
  'barcelona', 'fc barcelona', 'barca', 'real madrid',
  'atletico madrid', 'atletico', 'bayern munich', 'bayern',
  'borussia dortmund', 'bvb', 'rb leipzig', 'leipzig',
  'paris saint germain', 'psg', 'olympique lyonnais', 'lyon',
  'olympique marseille', 'marseille', 'ac milan', 'milan',
  'inter milan', 'inter', 'juventus', 'juve', 'napoli',
  'as roma', 'roma', 'lazio', 'ajax', 'psv', 'psv eindhoven',
  'feyenoord', 'fc porto', 'porto', 'benfica', 'sporting cp',
  'sporting', 'celtic', 'rangers', 'galatasaray', 'gala',
  'fenerbahce', 'fener', 'besiktas', 'bjk',
  
  // Asian Retailers
  'uniqlo', 'muji', 'yesstyle', 'shein', 'taobao', 'tmall',
  'lazada', 'tokopedia', '11street', 'gmarket', 'qoo10',
  
  // UK & European Department Stores
  'marks spencer', 'marks and spencer', 'm&s', 'john lewis',
  'debenhams', 'house of fraser', 'harvey nichols', 'harrods',
  'selfridges', 'liberty london', 'fenwick', 'tk maxx', 'next',
  'matalan', 'primark', 'sports direct', 'argos', 'very', 'littlewoods',
  
  // UK & European Fashion Retailers
  'gant', 'reiss', 'ted baker', 'whistles', 'hobbs', 'jigsaw',
  'karen millen', 'phase eight', 'mint velvet', 'joules',
  'crew clothing', 'white stuff', 'fatface', 'superdry', 'jack wills',
  'river island', 'topshop', 'topman', 'new look', 'quiz clothing',
  'end clothing', 'mr porter', 'browns fashion', 'flannels',
  'boohoo', 'booho', 'boo hoo', 'boohoo man', 'boohoowoman',
  'prettylittlething', 'plt', 'pretty little thing', 'missguided',
  'misguided', 'nasty gal', 'nastygal', 'oliver bonas', 'monsoon',
  'oasis fashion', 'warehouse fashion', 'dorothy perkins', 'burton',
  'sosandar', 'hush homewear', 'boden', 'toast clothing', 'seasalt cornwall',
  'french connection', 'fcuk', 'jaeger', 'great plains',
  'ghost london', 'me+em', 'me and em', 'meem',
  'rixo london', 'kitri studio', 'omnes clothing', 'never fully dressed',
  'needle and thread', 'needle & thread', 'finery london',
  'wyse london', 'mint velvet', 'hope fashion',
  'brora cashmere', 'celtic & co', 'celtic and co',
  'pure collection', 'damsel in a dress', 'phase eight',
  'l.k.bennett', 'lk bennett', 'laura ashley',
  'planet fashion', 'kaliko fashion', 'precis petite', 'windsmoor',
  'jacques vert', 'eastex fashion', 'alexon fashion', 'ann harvey',
  'minuet petite', 'country casuals', 'berkertex',
  'boss', 'hugo',
  'frankie say', 'frankie says', 'frankie says relax',
  'ben sherman', 'ben sherman originals',
  'vivienne westwood', 'vivienne westwood anglomania',
  'ax paris', 'ax paris curve', 'ax paris petite',
  
  // European Luxury & Premium
  'galeries lafayette', 'printemps', 'la redoute', 'spartoo', 'about you',
  'boozt', 'breuninger', 'peek cloppenburg', 'kadewe', 'rinascente',
  'el corte ingles', 'stockmann', 'illum', 'magasin', 'bijenkorf',
  'kaufhof', 'karstadt', 'bon marche', 'fnac',
  
  // Australian & NZ Retailers
  'david jones', 'myer', 'the iconic', 'rebel sport',
  'cotton on', 'country road', 'witchery', 'the warehouse', 'farmers',
  
  // Canadian Retailers
  'hudson bay', 'hudsons bay', 'canadian tire', 'sport chek', 'roots',
  'ssense', 'simons', 'la maison simons', 'winners', 'marks',
  
  // High Street & Fast Fashion
  'uniqlo', 'zara', 'von dutch',
  'h&m', 'h & m', 'h and m', 'hennes & mauritz', 'hennes and mauritz',
  'mango', 'bershka', 'pull bear', 'massimo dutti', 'stradivarius',
  'urban outfitters', 'cos', 'arket', 'weekday', 'monki',
  'other stories', 'forever 21', 'hollister', 'abercrombie',
  'american eagle',
  
  // Sports & Outdoor
  'foot locker', 'jd sports', 'size', 'snipes', 'office', 'schuh',
  'decathlon', 'go outdoors', 'cotswold outdoor', 'mountain warehouse',
  'blacks', 'millets', 'ultimate outdoors', 'rei', 'bass pro',
  'academy sports', 'dicks sporting goods',
  
  // Premium & Contemporary
  'apc', 'sandro', 'maje', 'the kooples', 'claudie pierlot',
  'bash', 'zadig voltaire', 'theory', 'joseph', 'all saints',
  'russell bromley', 'kurt geiger', 'lk bennett', 'club monaco',
  'anthropologie',
  
  // Luxury Brands
  'fendi', 'gucci', 'prada', 'louis vuitton', 'louisvuitton', 'dior', 'balenciaga',
  'saint laurent', 'ysl', 'bottega veneta', 'burberry', 'burbery', 'versace', 'versachi',
  'valentino', 'dolce gabbana', 'dolce and gabbana', 'alexander mcqueen', 'givenchy',
  'loewe', 'celine', 'chanel', 'channel', 'hermes', 'cartier', 'tiffany', 'omega',
  'rolex', 'tag heuer', 'tagheuer', 'bulgari', 'bvlgari',
  
  // Contemporary & Streetwear
  'stone island', 'off white', 'palm angels', 'amiri', 'fear of god',
  'acne studios', 'ami paris', 'maison margiela', 'rick owens',
  'thom browne', 'jil sander', 'jacquemus', 'lemaire', 'supreme',
  'bape', 'stussy', 'palace', 'kith', 'neighborhood', 'wtaps',
  
  // Casual & Workwear
  'carhartt', 'dickies', 'champion', 'the north face', 'northface',
  'north face', 'tnf', 'patagonia', 'columbia', 'vans', 'converse',
  'new balance', 'reebok', 'asics', 'under armour', 'fila', 'ellesse',
  'kappa', 'napapijri', 'fred perry', 'helly hansen', 'fjallraven',
  'mammut', 'duluth trading', 'duluth trading co', 'walls', 'key apparel',
  
  // UK Supermarket Fashion
  'asda', 'asda george', 'george at asda',
  'sainsburys', 'sainsburys tu', 'tu clothing',
  'tesco', 'tesco f&f', 'florence and fred',
  'matalan', 'peacocks', 'primark',
  
  // UK High Street Fashion
  'marks spencer', 'marks and spencer', 'm&s', 'next',
  'new look', 'river island', 'topshop', 'topman',
  'miss selfridge', 'dorothy perkins', 'warehouse',
  'wallis', 'monsoon', 'evans',
  'fat face', 'fatface', 'white stuff', 'joules',
  'jojo maman bebe', 'tk maxx', 'tkmaxx',
  'sports direct', 'jd sports', 'jjb sports',
  'moss bros', 'moss', 'burton', 'jane norman',
  
  // UK Premium & Designer Fashion
  'ted baker', 'karen millen', 'phase eight',
  'house of cb', 'lipsy', 'mint velvet', 'hobbs',
  'jigsaw', 'whistles', 'reiss', 'pretty eccentric',
  'sweaty betty', 'weird fish', 'spirit of the andes',
  'rigby peller', 'austin reed', 'viyella',
  
  // UK Online Fashion
  'asos', 'boohoo', 'prettylittlething', 'plt',
  'missguided', 'matches fashion', 'matchesfashion',
  'figleaves', 'long tall sally', 'rat boa',
  'proviz sports', 'roman originals', 'sock shop',
  
  // Historical UK Retailers
  'arcadia group', 'biba', 'dunn co', 'faith shoes',
  'fifty shilling tailors', 'john collier',
  'principles', 'richard shops', 'mk one',
  'republic', 'store twenty one', 'tie rack',
  
  // Eastern European Fashion
  'reserved', 'cropp', 'mohito', 'wildberries', 'lamoda',
  'ccc shoes', 'ochnik', 'medicine', 'tatuum', 'diverse',
  
  // Chinese & Taiwanese Fashion
  'li ning', 'lining', 'anta sports', 'anta', 'semir', 'peacebird',
  'urban revivo', 'ochirly', 'belle', 'mlb china', 'cabbeen',
  'jeanswest', 'septwolves', 'marisfrolg', 'joeone',
  
  // Mexican & Latin American Fashion
  'liverpool', 'el palacio de hierro', 'suburbia', 'coppel',
  'oggi jeans', 'cuidado con el perro', 'squalo', 'sexy jeans',
  'shasa', 'almacenes exito', 'jumbo argentina', 'falabella',
  'ripley', 'saga falabella', 'renner', 'riachuelo',
  
  // Southeast Asian Fashion
  'pomelo fashion', 'love bonito', 'rabeanco', 'padini',
  'bench', 'penshoppe', 'greyhound', 'jaspal', 'cps chaps',
  'g2000', 'uniqlo', 'muji',
  
  // Turkish & Middle Eastern Fashion
  'lc waikiki', 'defacto', 'ipekyol', 'network', 'machka',
  'hotic', 'penti', 'roman', 'flo', 'mudo', 'namshi', 'ounass',
  
  // German & Central European Fashion
  'peek cloppenburg', 'soliver', 's oliver', 'tom tailor',
  'gerry weber', 'orsay', 'deichmann', 'takko fashion',
  'bonprix', 'hallhuber', 'betty barclay',
  
  // Italian Fashion Retailers
  'ovs', 'calzedonia', 'intimissimi', 'tezenis', 'upim',
  'carpisa', 'yamamay', 'fiorella rubino', 'imperial fashion',
  'piazza italia', 'antony morato',
  
  // Spanish & Portuguese Fashion
  'springfield', 'womensecret', 'cortefiel', 'adolfo dominguez',
  'bimba y lola', 'mayoral', 'gocco', 'panama jack', 'sfera',
  'trucco', 'zara', 'mango', 'massimo dutti', 'pull bear',
  
  // Vintage & Second-hand
  'vestiaire collective', 'depop', 'thredup', 'the realreal',
  'rebag', 'round two', 'kilogarm', 'think twice',
  'pop boutique', 'melia vintage', 'buffalo exchange',
  
  // Children's & Maternity Wear
  'carters', 'oshkosh bgosh', 'oshkosh', 'gymboree',
  'janie and jack', 'hanna andersson', 'jacadi', 'bonpoint',
  'sergent major', 'il gufo', 'chicco', 'jojo maman bebe',
  
  // Workwear & Uniforms
  'cintas', 'aramark', 'bulwark fr', 'mascot workwear',
  'snickers workwear', 'engelbert strauss', 'fristads kansas',
  'chef works', 'landau scrubs', 'figs', 'carhartt', 'dickies',
  
  // Outdoor & Tactical Wear
  'klattermusen', 'houdini sportswear', 'sherpa adventure gear',
  'montane', 'sitka gear', 'harkila', 'first lite', 'kuiu',
  'helikon tex', 'uf pro', 'patagonia', 'arc teryx',
  'the north face', 'columbia',
  
  // Specialty Undergarments & Swimwear
  'agent provocateur', 'fleur du mal', 'journelle', 'panache',
  'curvy kate', 'elomi', 'simone perele', 'cuup', 'tomboyx',
  'speedo', 'arena', 'gottex', 'orlebar brown', 'andie swim',
  'victorias secret', 'la perla', 'triumph',
  
  // Digital Native Brands
  'asket', 'son of a tailor', 'black lapel', 'dagne dover',
  'aurate', 'soko', 'baboon to the moon', 'monos',
  'western rise', 'duer', 'warby parker', 'everlane',
  'away', 'allbirds', 'rothys',

  // British Heritage & Outerwear Brands
  'belstaff', 'barbour', 'barbour international',
  'cp company', 'c.p. company', 'c.p company',
  'cord', 'cordings', 'cordings of piccadilly',
  'hunter', 'hunter boots', 'dubarry',
  'mackintosh', 'aquascutum', 'grenfell',
  'peregrine', 'private white v.c.', 'albam',
  'sunspel', 'john smedley', 'hackett',
  'musto', 'henri lloyd', 'schoffel',
  'paul smith', 'paul smith london', 'ps paul smith',
  'cotton traders', 'oliver sweeney', 'turnbull & asser',
  'drakes', 'drakes london', 'edward green',
  'john lobb', 'trickers', 'crockett & jones',
  'churchs', 'churches shoes', 'loake',
  'oliver spencer', 'nigel cabourn', 'universal works',
  'margaret howell', 'folk clothing', 'albam clothing',
  'percival', 'community clothing', 'blackhorse lane',
  'lyle scott', 'lyle & scott', 'lyle and scott', 'lylle and scott',
  'passenger clothing', 'passenger',

  // Denim & Workwear 
  'levis', 'levi', 'levi strauss', 'levi strauss & co',
  'levis vintage clothing', 'lvc', 'levis made & crafted',
  'lee', 'lee cooper', 'wrangler', 'lee jeans',
  'diesel', 'replay', 'true religion', 'prps',
  'raw denim', 'selvedge denim', 'iron heart',
  'momotaro', 'edwin', 'nudie', 'acne studios',

  // Ralph Lauren Brands
  'ralph lauren', 'polo ralph lauren', 'purple label',
  'rrl', 'double rl', 'ralph lauren purple label',
  'polo sport', 'club monaco', 'chaps',
  'lauren ralph lauren', 'polo golf',
  'ralph lauren home', 'ralph lauren collection',
];

export const ACCEPTED_FILE_TYPES = ['.xlsx', '.xls', '.csv'] as const;
export const COLUMNS_TO_EXCLUDE = ['CPC (USD)', 'SERP Features', 'Keyword Difficulty'];
export const DEFAULT_MIN_VOLUME = 100;

export interface FileData {
  id: string;
  originalData: Record<string, string | number>[];
  filteredData: Record<string, string | number>[];
  fileName: string;
  sheetName: string;
  originalRows: number;
  filteredRows: number;
  storeFilteredRows: number;
  volumeFilteredRows: number;
  customStoreFilteredRows: number;
}

export interface ExtendedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  webkitdirectory?: string;
  directory?: string;
} 