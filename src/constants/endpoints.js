const BASE_URL = 'https://api.hear2.app';
const AI_URL = 'https://ai.hear2.app';

export default {
  BASE_URL,
  AI_URL,
  auth: {
    login: `${BASE_URL}/auth/login`,
    signup: `${BASE_URL}/auth/signup`,
    social: `${BASE_URL}/auth/social`,
  },
  chat: {
    rooms: `${BASE_URL}/chat/rooms`,
    messages: (roomId) => `${BASE_URL}/chat/rooms/${roomId}/messages`,
    ws: `wss://api.hear2.app/ws/chat`,
  },
  memory: {
    list: `${BASE_URL}/memory`,
    create: `${BASE_URL}/memory`,
  },
  calendar: {
    events: `${BASE_URL}/calendar/events`,
  },
  couple: {
    connect: `${BASE_URL}/couple/connect`,
    location: `${BASE_URL}/couple/location`,
  },
  ai: {
    emotion: `${AI_URL}/emotion`,
    judge: `${AI_URL}/judge`,
    report: `${AI_URL}/report`,
    question: `${AI_URL}/question`,
    dna: `${AI_URL}/predict/dna`,
    whatif: `${AI_URL}/predict/whatif`,
  },
};
