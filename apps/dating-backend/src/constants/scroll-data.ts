export type ScrollDataType = {
  id: string
  displayName: string
  age: number
  gender: 'MALE' | 'FEMALE' | 'NON_BINARY' | 'OTHER'
  orientation: string
  bio: string
  profession: string
  hobbies: string[]
  religion: string
  location: string
  heightCm: number
  preferences: {
    preferredGenders: Array<'MALE' | 'FEMALE' | 'NON_BINARY' | 'OTHER'>
    ageMin: number
    ageMax: number
    maxDistanceKm: number
  }
  profileImage: string
  images: string[]
}

export const MOCK_DATA: ScrollDataType[] = [
  {
    id: '1',
    displayName: 'Mountain Adventure',
    age: 28,
    gender: 'FEMALE',
    orientation: 'Heterosexual',
    bio: 'Nature lover, always seeking new adventures and good company.',
    profession: 'Adventurer',
    hobbies: ['Hiking', 'Photography', 'Travel'],
    religion: 'None',
    location: 'Denver, CO',
    heightCm: 170,
    preferences: {
      preferredGenders: ['MALE', 'FEMALE'],
      ageMin: 25,
      ageMax: 35,
      maxDistanceKm: 100,
    },
    profileImage: 'https://cdn.britannica.com/54/264854-050-1F82F2BF/indian-actor-hrithik-roshan-european-premiere-kites-odeon-west-may-18-2010-london-england.jpg?w=300',
    images: [
      'https://fastly.picsum.photos/id/541/200/300.jpg?hmac=nhG-hlD63wW6srZpMlMH73GwqdwqiMD5VDrLV7TQJ08',
      'https://fastly.picsum.photos/id/951/200/200.jpg?hmac=FVINiB5mMdXIUDDk4AYptO4s4A2ETDNX4n3RSDaoB4E',
      'https://fastly.picsum.photos/id/541/200/300.jpg?hmac=nhG-hlD63wW6srZpMlMH73GwqdwqiMD5VDrLV7TQJ08',
      'https://fastly.picsum.photos/id/951/200/200.jpg?hmac=FVINiB5mMdXIUDDk4AYptO4s4A2ETDNX4n3RSDaoB4E',
    ],
    // ...existing code...
  },
  {
    id: '2',
    displayName: 'Ocean Breeze',
    age: 31,
    gender: 'MALE',
    orientation: 'Heterosexual',
    bio: 'Chef by day, surfer by dawn. Love good food and good vibes.',
    profession: 'Chef',
    hobbies: ['Surfing', 'Cooking', 'Music'],
    religion: 'None',
    location: 'San Diego, CA',
    heightCm: 180,
    preferences: {
      preferredGenders: ['FEMALE'],
      ageMin: 28,
      ageMax: 36,
      maxDistanceKm: 50,
    },
    profileImage: 'https://resiliencechallenge.nz/wp-content/uploads/fallback-person.svg',
    images: [
      'https://fastly.picsum.photos/id/541/200/300.jpg?hmac=nhG-hlD63wW6srZpMlMH73GwqdwqiMD5VDrLV7TQJ08',
      'https://fastly.picsum.photos/id/951/200/200.jpg?hmac=FVINiB5mMdXIUDDk4AYptO4s4A2ETDNX4n3RSDaoB4E',
      'https://fastly.picsum.photos/id/541/200/300.jpg?hmac=nhG-hlD63wW6srZpMlMH73GwqdwqiMD5VDrLV7TQJ08',
      'https://fastly.picsum.photos/id/951/200/200.jpg?hmac=FVINiB5mMdXIUDDk4AYptO4s4A2ETDNX4n3RSDaoB4E',
    ],
    // ...existing code...
  },
  {
    id: '3',
    displayName: 'Forest Path',
    age: 26,
    gender: 'NON_BINARY',
    orientation: 'Bisexual',
    bio: 'Bookworm and plant parent. I love deep talks and cozy spaces.',
    profession: 'Gardener',
    hobbies: ['Reading', 'Gardening', 'Yoga'],
    religion: 'None',
    location: 'Portland, OR',
    heightCm: 165,
    preferences: {
      preferredGenders: ['MALE', 'FEMALE', 'NON_BINARY'],
      ageMin: 24,
      ageMax: 32,
      maxDistanceKm: 80,
    },
    profileImage: 'https://resiliencechallenge.nz/wp-content/uploads/fallback-person.svg',
    images: [
      'https://fastly.picsum.photos/id/541/200/300.jpg?hmac=nhG-hlD63wW6srZpMlMH73GwqdwqiMD5VDrLV7TQJ08',
      'https://fastly.picsum.photos/id/951/200/200.jpg?hmac=FVINiB5mMdXIUDDk4AYptO4s4A2ETDNX4n3RSDaoB4E',
      'https://fastly.picsum.photos/id/541/200/300.jpg?hmac=nhG-hlD63wW6srZpMlMH73GwqdwqiMD5VDrLV7TQJ08',
      'https://fastly.picsum.photos/id/951/200/200.jpg?hmac=FVINiB5mMdXIUDDk4AYptO4s4A2ETDNX4n3RSDaoB4E',
    ],
    // ...existing code...
  },
  {
    id: '4',
    displayName: 'City Lights',
    age: 29,
    gender: 'MALE',
    orientation: 'Homosexual',
    bio: 'City dweller who loves the buzz of nightlife and new experiences.',
    profession: 'Fashion Designer',
    hobbies: ['Dancing', 'Fashion', 'Movies'],
    religion: 'None',
    location: 'New York, NY',
    heightCm: 175,
    preferences: {
      preferredGenders: ['MALE'],
      ageMin: 27,
      ageMax: 34,
      maxDistanceKm: 30,
    },
    profileImage: 'https://resiliencechallenge.nz/wp-content/uploads/fallback-person.svg',
    images: [
      'https://fastly.picsum.photos/id/541/200/300.jpg?hmac=nhG-hlD63wW6srZpMlMH73GwqdwqiMD5VDrLV7TQJ08',
      'https://fastly.picsum.photos/id/951/200/200.jpg?hmac=FVINiB5mMdXIUDDk4AYptO4s4A2ETDNX4n3RSDaoB4E',
      'https://fastly.picsum.photos/id/541/200/300.jpg?hmac=nhG-hlD63wW6srZpMlMH73GwqdwqiMD5VDrLV7TQJ08',
      'https://fastly.picsum.photos/id/951/200/200.jpg?hmac=FVINiB5mMdXIUDDk4AYptO4s4A2ETDNX4n3RSDaoB4E',
    ],
    // ...existing code...
  },
  {
    id: '5',
    displayName: 'Desert Dreamer',
    age: 34,
    gender: 'FEMALE',
    orientation: 'Heterosexual',
    bio: 'Artist and yogi, inspired by the beauty of the desert.',
    profession: 'Artist',
    hobbies: ['Stargazing', 'Art', 'Yoga'],
    religion: 'Spiritual',
    location: 'Phoenix, AZ',
    heightCm: 168,
    preferences: {
      preferredGenders: ['MALE'],
      ageMin: 30,
      ageMax: 40,
      maxDistanceKm: 120,
    },
    profileImage: 'https://resiliencechallenge.nz/wp-content/uploads/fallback-person.svg',
    images: [
      'https://fastly.picsum.photos/id/541/200/300.jpg?hmac=nhG-hlD63wW6srZpMlMH73GwqdwqiMD5VDrLV7TQJ08',
      'https://fastly.picsum.photos/id/951/200/200.jpg?hmac=FVINiB5mMdXIUDDk4AYptO4s4A2ETDNX4n3RSDaoB4E',
      'https://fastly.picsum.photos/id/541/200/300.jpg?hmac=nhG-hlD63wW6srZpMlMH73GwqdwqiMD5VDrLV7TQJ08',
      'https://fastly.picsum.photos/id/951/200/200.jpg?hmac=FVINiB5mMdXIUDDk4AYptO4s4A2ETDNX4n3RSDaoB4E',
    ],
    // ...existing code...
  },
  {
    id: '6',
    displayName: 'Tech Explorer',
    age: 27,
    gender: 'MALE',
    orientation: 'Heterosexual',
    bio: 'Startup enthusiast and gamer, always up for a hackathon.',
    profession: 'Developer',
    hobbies: ['Coding', 'Gaming', 'Startups'],
    religion: 'None',
    location: 'San Francisco, CA',
    heightCm: 178,
    preferences: {
      preferredGenders: ['FEMALE'],
      ageMin: 22,
      ageMax: 29,
      maxDistanceKm: 60,
    },
    profileImage: 'https://resiliencechallenge.nz/wp-content/uploads/fallback-person.svg',
    images: [
      'https://fastly.picsum.photos/id/541/200/300.jpg?hmac=nhG-hlD63wW6srZpMlMH73GwqdwqiMD5VDrLV7TQJ08',
      'https://fastly.picsum.photos/id/951/200/200.jpg?hmac=FVINiB5mMdXIUDDk4AYptO4s4A2ETDNX4n3RSDaoB4E',
      'https://fastly.picsum.photos/id/541/200/300.jpg?hmac=nhG-hlD63wW6srZpMlMH73GwqdwqiMD5VDrLV7TQJ08',
      'https://fastly.picsum.photos/id/951/200/200.jpg?hmac=FVINiB5mMdXIUDDk4AYptO4s4A2ETDNX4n3RSDaoB4E',
    ],
    // ...existing code...
  },
  {
    id: '7',
    displayName: 'Countryside Calm',
    age: 32,
    gender: 'FEMALE',
    orientation: 'Heterosexual',
    bio: 'Country girl at heart, loves simple joys and good company.',
    profession: 'Cook',
    hobbies: ['Horseback Riding', 'Cooking', 'Gardening'],
    religion: 'Christian',
    location: 'Nashville, TN',
    heightCm: 172,
    preferences: {
      preferredGenders: ['MALE'],
      ageMin: 30,
      ageMax: 38,
      maxDistanceKm: 90,
    },
    profileImage: 'https://resiliencechallenge.nz/wp-content/uploads/fallback-person.svg',
    images: [
      'https://fastly.picsum.photos/id/541/200/300.jpg?hmac=nhG-hlD63wW6srZpMlMH73GwqdwqiMD5VDrLV7TQJ08',
      'https://fastly.picsum.photos/id/951/200/200.jpg?hmac=FVINiB5mMdXIUDDk4AYptO4s4A2ETDNX4n3RSDaoB4E',
      'https://fastly.picsum.photos/id/541/200/300.jpg?hmac=nhG-hlD63wW6srZpMlMH73GwqdwqiMD5VDrLV7TQJ08',
      'https://fastly.picsum.photos/id/951/200/200.jpg?hmac=FVINiB5mMdXIUDDk4AYptO4s4A2ETDNX4n3RSDaoB4E',
    ],
    // ...existing code...
  },
  {
    id: '8',
    displayName: 'Artistic Soul',
    age: 25,
    gender: 'NON_BINARY',
    orientation: 'Pansexual',
    bio: 'Creative spirit, always looking for inspiration and connection.',
    profession: 'Artist',
    hobbies: ['Painting', 'Music', 'Poetry'],
    religion: 'None',
    location: 'Austin, TX',
    heightCm: 160,
    preferences: {
      preferredGenders: ['MALE', 'FEMALE', 'NON_BINARY'],
      ageMin: 22,
      ageMax: 28,
      maxDistanceKm: 70,
    },
    profileImage: 'https://resiliencechallenge.nz/wp-content/uploads/fallback-person.svg',
    images: [
      'https://fastly.picsum.photos/id/541/200/300.jpg?hmac=nhG-hlD63wW6srZpMlMH73GwqdwqiMD5VDrLV7TQJ08',
      'https://fastly.picsum.photos/id/951/200/200.jpg?hmac=FVINiB5mMdXIUDDk4AYptO4s4A2ETDNX4n3RSDaoB4E',
      'https://fastly.picsum.photos/id/541/200/300.jpg?hmac=nhG-hlD63wW6srZpMlMH73GwqdwqiMD5VDrLV7TQJ08',
      'https://fastly.picsum.photos/id/951/200/200.jpg?hmac=FVINiB5mMdXIUDDk4AYptO4s4A2ETDNX4n3RSDaoB4E',
    ],
    // ...existing code...
  },
  {
    id: '9',
    displayName: 'Fitness Fanatic',
    age: 30,
    gender: 'MALE',
    orientation: 'Heterosexual',
    bio: 'Personal trainer who loves helping others reach their goals.',
    profession: 'Trainer',
    hobbies: ['Running', 'Cycling', 'Nutrition'],
    religion: 'None',
    location: 'Chicago, IL',
    heightCm: 182,
    preferences: {
      preferredGenders: ['FEMALE'],
      ageMin: 26,
      ageMax: 33,
      maxDistanceKm: 40,
    },
    profileImage: 'https://resiliencechallenge.nz/wp-content/uploads/fallback-person.svg',
    images: [
      'https://fastly.picsum.photos/id/541/200/300.jpg?hmac=nhG-hlD63wW6srZpMlMH73GwqdwqiMD5VDrLV7TQJ08',
      'https://fastly.picsum.photos/id/951/200/200.jpg?hmac=FVINiB5mMdXIUDDk4AYptO4s4A2ETDNX4n3RSDaoB4E',
      'https://fastly.picsum.photos/id/541/200/300.jpg?hmac=nhG-hlD63wW6srZpMlMH73GwqdwqiMD5VDrLV7TQJ08',
      'https://fastly.picsum.photos/id/951/200/200.jpg?hmac=FVINiB5mMdXIUDDk4AYptO4s4A2ETDNX4n3RSDaoB4E',
    ],
    // ...existing code...
  },
  {
    id: '10',
    displayName: 'Book Café Buddy',
    age: 24,
    gender: 'FEMALE',
    orientation: 'Bisexual',
    bio: 'Book lover and café explorer, always up for a game night.',
    profession: 'Student',
    hobbies: ['Reading', 'Coffee', 'Board Games'],
    religion: 'None',
    location: 'Seattle, WA',
    heightCm: 158,
    preferences: {
      preferredGenders: ['MALE', 'FEMALE'],
      ageMin: 21,
      ageMax: 27,
      maxDistanceKm: 20,
    },
    profileImage: 'https://resiliencechallenge.nz/wp-content/uploads/fallback-person.svg',
    images: [
      'https://fastly.picsum.photos/id/541/200/300.jpg?hmac=nhG-hlD63wW6srZpMlMH73GwqdwqiMD5VDrLV7TQJ08',
      'https://fastly.picsum.photos/id/951/200/200.jpg?hmac=FVINiB5mMdXIUDDk4AYptO4s4A2ETDNX4n3RSDaoB4E',
      'https://fastly.picsum.photos/id/541/200/300.jpg?hmac=nhG-hlD63wW6srZpMlMH73GwqdwqiMD5VDrLV7TQJ08',
      'https://fastly.picsum.photos/id/951/200/200.jpg?hmac=FVINiB5mMdXIUDDk4AYptO4s4A2ETDNX4n3RSDaoB4E',
    ],
    // ...existing code...
  },
  {
    id: '11',
    displayName: 'Sneha Srivastava',
    age: 25,
    gender: 'FEMALE',
    orientation: 'Heterosexual',
    bio: 'Chef with a playful spirit. I love making people smile and enjoy good company.',
    profession: 'Chef',
    hobbies: ['Pagal banana', 'Bewakofim'],
    religion: 'Pakistani',
    location: 'Mumbai, India',
    heightCm: 40,
    preferences: {
      preferredGenders: ['MALE'],
      ageMin: 40,
      ageMax: 60,
      maxDistanceKm: 500,
    },
    profileImage: 'https://drive.google.com/drive/u/0/folders/1PhFbRNWKfISFuPSEQ0G-JjoU3iF5xL0X',
    images: [
      'https://fastly.picsum.photos/id/541/200/300.jpg?hmac=nhG-hlD63wW6srZpMlMH73GwqdwqiMD5VDrLV7TQJ08',
      'https://fastly.picsum.photos/id/951/200/200.jpg?hmac=FVINiB5mMdXIUDDk4AYptO4s4A2ETDNX4n3RSDaoB4E',
      'https://fastly.picsum.photos/id/541/200/300.jpg?hmac=nhG-hlD63wW6srZpMlMH73GwqdwqiMD5VDrLV7TQJ08',
      'https://fastly.picsum.photos/id/951/200/200.jpg?hmac=FVINiB5mMdXIUDDk4AYptO4s4A2ETDNX4n3RSDaoB4E',
    ],
    // ...existing code...
  },
]
