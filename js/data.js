/**
 * Literating India Foundation - Nasha Mukt Yuva
 * Participants Embedded Dataset
 * Single source of truth for participant lookup & verification
 */

const INITIAL_PARTICIPANTS = [
  {"name":"Rajdeep Singh","phone":"9914991466","topic":"Debate","class":"6th"},
  {"name":"Anihant","phone":"9115551129","topic":"Debate","class":"6th"},
  {"name":"Dhawan","phone":"7837786903","topic":"Debate","class":"6th"},
  {"name":"Tanvipreet Kaur","phone":"7837047969","topic":"Debate","class":"8th"},
  {"name":"Sharanpreet Kaur","phone":"9814668748","topic":"Debate","class":"8th"},
  {"name":"Gurkirat Singh","phone":"6284763335","topic":"Debate","class":"9th"},
  {"name":"Jasveer Kaur","phone":"9814732793","topic":"Declamation","class":"7th"},
  {"name":"Harseen kaur","phone":"7009000461","topic":"Declamation","class":"7th"},
  {"name":"Chahatnoor Singh","phone":"8283817006","topic":"Declamation","class":"7th"},
  {"name":"Divjot Singh","phone":"9779085865","topic":"Declamation","class":"7th"},
  {"name":"Manraj Singh","phone":"7973036891","topic":"Declamation","class":"7th"},
  {"name":"Jagjot Kaur","phone":"7009327811","topic":"Declamation","class":"8th"},
  {"name":"Agamjot Kaur","phone":"9914966373","topic":"Rangoli","class":"6th"},
  {"name":"Manreet Kaur","phone":"7888501320","topic":"Rangoli","class":"6th"},
  {"name":"Gururehmat Kaur","phone":"9815860608","topic":"Rangoli","class":"6th"},
  {"name":"Rehmat Kaur","phone":"9815524251","topic":"Rangoli","class":"6th"},
  {"name":"Ikman Kaur","phone":"9646866732","topic":"Rangoli","class":"6th"},
  {"name":"Ishnoor Kaur","phone":"9988060711","topic":"Rangoli","class":"6th"},
  {"name":"Jaismeen Kaur","phone":"7087537024","topic":"Rangoli","class":"6th"},
  {"name":"Harnoor Kaur","phone":"9855673974","topic":"Rangoli","class":"6th"},
  {"name":"Harnoor Kaur","phone":"9815046097","topic":"Rangoli","class":"7th"},
  {"name":"Tanveer Kaur","phone":"9876044667","topic":"Rangoli","class":"7th"},
  {"name":"Gracejit Kaur","phone":"9803207342","topic":"Rangoli","class":"7th"},
  {"name":"Ravleen Kaur","phone":"8360498022","topic":"Rangoli","class":"7th"},
  {"name":"Harmandeep Singh","phone":"8872130309","topic":"Rangoli","class":"7th"},
  {"name":"Krinul","phone":"8360022693","topic":"Rangoli","class":"7th"},
  {"name":"Gurleen Kaur","phone":"9872169228","topic":"Rangoli","class":"7th"},
  {"name":"Kanish","phone":"9464328511","topic":"Rangoli","class":"7th"},
  {"name":"Kiratpreet Kaur","phone":"6239554748","topic":"Rangoli","class":"8th"},
  {"name":"Arshpreet Kaur","phone":"8198010973","topic":"Rangoli","class":"8th"},
  {"name":"Akamdeep Kaur","phone":"9878212401","topic":"Rangoli","class":"8th"},
  {"name":"Sehajpreet Kaur","phone":"7814131375","topic":"Poster Making","class":"7th"},
  {"name":"Avneet Kaur","phone":"7340750774","topic":"Poster Making","class":"7th"},
  {"name":"Malika","phone":"7973301990","topic":"Poster Making","class":"7th"},
  {"name":"Anandjot Kaur","phone":"8360175710","topic":"Poster Making","class":"7th"},
  {"name":"Gurleen Kaur","phone":"9872169228","topic":"Poster Making","class":"7th"},
  {"name":"Krimul Kaur","phone":"8360022693","topic":"Poster Making","class":"7th"},
  {"name":"Smiledeep Kaur","phone":"9501120167","topic":"Poster Making","class":"7th"},
  {"name":"Seerat Kaur","phone":"7973166901","topic":"Poster Making","class":"8th"},
  {"name":"Harleen Kaur","phone":"7986074854","topic":"Poster Making","class":"8th"},
  {"name":"Harnoor Kaur","phone":"9888818381","topic":"Poster Making","class":"8th"},
  {"name":"Harmandeep Singh","phone":"8872130309","topic":"Singing","class":"7th"},
  {"name":"Japleen Kaur","phone":"8437700452","topic":"Singing","class":"7th"},
  {"name":"Hargunpreet Kaur","phone":"7837178949","topic":"Singing","class":"7th"},
  {"name":"Pawandeep Singh","phone":"8264231807","topic":"Singing","class":"7th"}
];

/**
 * Loads all participants from the authoritative database dataset
 * Assigns sequential IDs starting at 1
 * @returns {Array<Object>}
 */
function getParticipants() {
  return INITIAL_PARTICIPANTS.map((item, index) => ({
    id: index + 1,
    name: item.name,
    phone: item.phone,
    topic: item.topic,
    class: item.class
  }));
}

/**
 * Single participant lookup by ID
 * @param {number} id
 * @returns {Object|null}
 */
function getParticipantById(id) {
  const all = getParticipants();
  return all.find(p => p.id === parseInt(id, 10)) || null;
}

/**
 * Case-insensitive search on authoritative participant database
 * Disambiguates duplicate names by Topic & Class
 * @param {string} query
 * @returns {Array<Object>}
 */
function searchParticipantsByName(query) {
  if (!query || typeof query !== 'string') return [];
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];

  const all = getParticipants();
  return all.filter(p => p.name.toLowerCase().includes(q));
}

// Global Browser / Node export
if (typeof window !== 'undefined') {
  window.ParticipantData = {
    getParticipants,
    getParticipantById,
    searchParticipantsByName,
    INITIAL_PARTICIPANTS
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getParticipants,
    getParticipantById,
    searchParticipantsByName,
    INITIAL_PARTICIPANTS
  };
}
