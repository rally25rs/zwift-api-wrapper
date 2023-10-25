// Return From
// GET https://zwiftpower.com/api3.php?do=critical_power_profile&zwift_id=&zwift_event_id=&type=watts
export type ZwiftPowerCriticalPowerProfile = {
  info: Array<{ name: string; effort_id: string | number; hide: boolean }>;
  efforts: Record<
    string,
    Array<{ x: number; y: number; date: number; zid: string }>
  >;
  events: Record<string, { name: string; zid: string }>;
};

// Return From
// GET https://zwiftpower.com/cache3/results/3859519_zwift.json
export type ZwiftPowerEventResults = {
  data: Array<ZwiftPowerEventResultsDataItem>;
};
export type ZwiftPowerEventResultsDataItem = {
  DT_RowId: string;
  name: string;
  watts: [string, number];
  wkg: [string, number];
  bpm: [string, number];
  hrm: number;
  race_time: [number, number];
  time_diff: number;
  zwid: string;
  label: string;
  dq_cat: string;
  pos: string;
  power_type: number;
  wkg_ftp: [string, number];
  wkg1200: [number, number];
  lagp: string;
  events: string;
};

export type MaxPower = Record<string, number>; // key = time in seconds, value = power

// Return From
// /api/profiles/${id}
export type ZwiftProfile = ZwiftShortProfile & {
  address: string | null;
  age: number;
  bodyType: number;
  connectedToStrava: boolean;
  connectedToTrainingPeaks: boolean;
  connectedToTodaysPlan: boolean;
  connectedToUnderArmour: boolean;
  connectedToWithings: boolean;
  connectedToFitbit: boolean;
  connectedToGarmin: boolean;
  connectedToRuntastic: boolean;
  connectedToZwiftPower: boolean;
  stravaPremium: false;
  bt: string;
  dob: string; // mm/dd/yyyy
  emailAddress: string;
  height: number;
  location: string;
  preferredLanguage: string; // 2-char language code
  mixpanelDistinctId: string;
  profileChanges: boolean;
  weight: number; // grams (1000 = 1kg)
  b: boolean;
  createdOn: string; // "2020-09-07T17:53:34.375+0000"
  source: string; // "zwift-public"
  origin: unknown | null; // unknown?
  launchedGameClient: string; // "09/07/2020 18:15:09 +0000"
  ftp: number; // watts
  userAgent: string;
  runTime1miInSeconds: number;
  runTime5kmInSeconds: number;
  runTime10kmInSeconds: number;
  runTimeHalfMarathonInSeconds: number;
  runTimeFullMarathonInSeconds: number;
  cyclingOrganization: unknown | null; // unknown?
  licenseNumber: unknown | null; // unknown?
  bigCommerceId: unknown | null; // unknown?
  marketingConsent: boolean;
  publicAttributes: Record<string, string>;
  privateAttributes: Record<string, string>;
  achievementLevel: number;
  totalDistance: number;
  totalDistanceClimbed: number;
  totalTimeInMinutes: number;
  totalInKomJersey: number;
  totalInSprintersJersey: number;
  totalInOrangeJersey: number;
  totalWattHours: number;
  totalExperiencePoints: number;
  targetExperiencePoints: number;
  totalGold: number;
  runAchievementLevel: number;
  totalRunDistance: number;
  totalRunTimeInMinutes: number;
  totalRunExperiencePoints: number;
  targetRunExperiencePoints: number;
  totalRunCalories: number;
  powerSourceType: string;
  powerSourceModel: string;
  virtualBikeModel: string;
  numberOfFolloweesInCommon: number;
  affiliate: unknown | null; // unknown?
  avantlinkId: unknown | null; // unknown?
  fundraiserId: unknown | null; // unknown?
  profilePropertyChanges: Array<
    { propertyName: string; changeCount: number; maxChanges: number }
  >;
};
export type ZwiftShortProfile = {
  id: number;
  publicId: string; // uuid
  firstName: string;
  lastName: string;
  male: boolean;
  eventCategory: string;
  imageSrc: string | null;
  imageSrcLarge: string | null;
  playerType: string;
  countryAlpha3: string;
  countryCode: number;
  useMetric: boolean;
  riding: boolean;
  privacy: {
    approvalRequired: boolean;
    displayWeight: boolean;
    minor: boolean;
    privateMessaging: boolean;
    defaultFitnessDataPrivacy: boolean;
    suppressFollowerNotification: boolean;
    displayAge: boolean;
    defaultActivityPrivacy: string; // "PUBLIC" | "PRIVATE"
  };
  socialFacts: {
    profileId: number;
    followersCount: number;
    followeesCount: number;
    followeesInCommonWithLoggedInPlayer: number;
    followerStatusOfLoggedInPlayer: string;
    followeeStatusOfLoggedInPlayer: string;
    isFavoriteOfLoggedInPlayer: boolean;
  } | null;
  worldId: number | null;
  enrolledZwiftAcademy: boolean;
  playerTypeId: number;
  playerSubTypeId: number | null; // Could be a string? not sure
  currentActivityId: number | null; // Could be a string? not sure
  likelyInGame: boolean;
};

// Return From
// /api/power-curve/power-profile
export type ZwiftPowerProfile = {
  zftp: number; // watts
  zmap: number; // watts
  vo2max: number; // ml/kg/min
  validPowerProfile: boolean;
  cpBestEfforts: {
    pointsWatts: Record<string, { value: number; date: string }>; // "1020": { "value": 264.0; "date": "2023-10-25T00:11:58.401Z" };
    pointsWattsPerKg: Record<string, { value: number; date: string }>; // "1020": { "value": 3.77; "date": "2023-10-25T00:11:58.401Z" };
  };
  relevantCpEfforts: Array<{
    watts: number;
    wattsKg: number;
    cpLabel: string; // "5 sec";
    duration: number; // seconds
    cpTimestamp: string; // "2023-10-19T22:51:25.501Z"
  }>;
  category: string; // "B"
  categoryWomen: string;
  categoryIndex: number; // 2 = "B", 3 = "C", 5 = "E"
  categoryWomenIndex: number;
  displayFemaleCategory: boolean;
  powerCompoundScore: number;
  weightInGrams: number;
  metricsTimestamp: string; // "2023-10-25T00:13:07.805Z";
};

// Return From
// /api/profiles/${athleteId}/activities
export type ZwiftActivities = Array<ZwiftActivitySummary>;
export type ZwiftActivitySummary = {
  id_str: string; // "1461969115156611104" not just the string of `id`. seems to be th unique tiemslot of an event.
  id: number; // 1461969115156611000 seems to be a top-level event that can occur at multiple scheduled times.
  profileId: number; // athleteId
  profile: ZwiftShortProfile;
  worldId: number;
  name: string;
  description?: string | null;
  privateActivity: boolean;
  sport: string; // "CYCLING"
  startDate: string; // "2023-10-24T23:08:36.323+0000"
  endDate: string; // "2023-10-25T00:13:07.805+0000"
  lastSaveDate: string; // "2023-10-25T00:13:07.805+0000"
  autoClosed: boolean;
  duration: string; // "1:4",
  distanceInMeters: number;
  fitFileBucket: string; // "s3-fit-prd-uswest2-zwift"
  fitFileKey: string; // "prod/2822923/3a5d2bf5-1461969115156611104"
  totalElevation: number; // meters
  avgWatts: number;
  rideOnGiven: boolean;
  activityRideOnCount: number;
  activityCommentCount: number;
  snapshotList: unknown | null; // unknown?
  calories: number;
  primaryImageUrl?: string | null;
  movingTimeInMs: number;
  privacy: string; // "PUBLIC"
};

// Return From
// /api/events/${eventId}
export type ZwiftEvent = {
  id: number;
  worldId: number;
  name: string;
  description: string;
  shortName: string | null;
  shortDescription: string;
  imageUrl: string;
  rulesId: number;
  mapId: number;
  routeId: number;
  routeUrl: string | null;
  jerseyHash: number;
  bikeHash: number | null;
  visible: boolean;
  overrideMapPreferences: boolean;
  eventStart: string; // "2023-10-25T09:00:00.000+0000"
  durationInSeconds: number;
  distanceInMeters: number;
  laps: number;
  privateEvent: boolean;
  invisibleToNonParticipants: boolean;
  followeeEntrantCount: number;
  totalEntrantCount: number;
  followeeSignedUpCount: number;
  totalSignedUpCount: number;
  followeeJoinedCount: number;
  totalJoinedCount: number;
  eventSubgroups: Array<ZwiftEventSubgroup>;
  eventSeries: {
    id: number;
    name: string;
    description: string | null;
    imported: boolean;
  };
  auxiliaryUrl: string;
  imageS3Name: string | null;
  imageS3Bucket: string | null;
  sport: string; // "CYCLING"
  cullingType: string; // "CULLING_SUBGROUP_ONLY"
  rulesSet: string[]; // ["ALLOWS_LATE_JOIN"]
  recurring: boolean;
  recurringOffset: unknown | null; // unknown?
  publishRecurring: boolean;
  parentId: number;
  type: string; // "EVENT_TYPE_GROUP_RIDE"
  workoutHash: number | null;
  customUrl: string;
  restricted: boolean;
  unlisted: boolean;
  eventSecret: unknown | null; // unknown?
  accessExpression: unknown | null; // unknown?
  tags: string[];
  qualificationRuleIds: unknown | null; // unknown?
  lateJoinInMinutes: number;
  timeTrialOptions: unknown | null; // unknown?
  microserviceName: unknown | null; // unknown?
  microserviceExternalResourceId: unknown | null; // unknown?
  microserviceEventVisibility: unknown | null; // unknown?
  minGameVersion: unknown | null; // unknown?
  recordable: boolean;
  imported: boolean;
  eventTemplateId: unknown | null; // unknown?
  categoryEnforcement: boolean;
  rangeAccessLabel: unknown | null; // unknown?
  eventType: string; // "GROUP_RIDE"
};
export type ZwiftEventSubgroup = {
  id: number;
  name: string;
  description: string;
  label: number;
  subgroupLabel: string; // "A"
  rulesId: number;
  mapId: number;
  routeId: number;
  routeUrl: string | null;
  jerseyHash: number;
  bikeHash: number | null;
  startLocation: number;
  invitedLeaders: unknown[]; // probably an array of numberic athleteIds?
  invitedSweepers: unknown[]; // probably an array of numberic athleteIds?
  paceType: number;
  fromPaceValue: number;
  toPaceValue: number;
  fieldLimit: number | null;
  registrationStart: string; // "2023-10-25T08:30:00.000+0000"
  registrationEnd: string; // "2023-10-25T09:00:00.000+0000"
  lineUpStart: string; // "2023-10-25T08:55:00.000+0000"
  lineUpEnd: string; // "2023-10-25T09:00:00.000+0000"
  eventSubgroupStart: string; // "2023-10-25T09:00:00.000+0000"
  durationInSeconds: number;
  laps: number;
  distanceInMeters: number;
  signedUp: boolean;
  signupStatus: number;
  registered: boolean;
  registrationStatus: number;
  followeeEntrantCount: number;
  totalEntrantCount: number;
  followeeSignedUpCount: number;
  totalSignedUpCount: number;
  followeeJoinedCount: number;
  totalJoinedCount: number;
  auxiliaryUrl: string;
  rulesSet: string[]; // ["ALLOWS_LATE_JOIN"]
  workoutHash: number | null;
  customUrl: string;
  overrideMapPreferences: boolean;
  tags: string[];
  lateJoinInMinutes: number;
  timeTrialOptions: unknown | null; // unknown?
  qualificationRuleIds: number | null;
  accessValidationResult: unknown | null; // unknown?
  accessRules: string[];
  rangeAccessLabel: unknown | null; // unknown?
};

// Return From
// /api/activities/${id}
export type ZwiftActivity = {
  activityRideOns: unknown[]; // unknown?
  avgHeartRate: number;
  maxHeartRate: number;
  maxWatts: number;
  avgCadenceInRotationsPerMinute: number;
  maxCadenceInRotationsPerMinute: number;
  avgSpeedInMetersPerSecond: number;
  maxSpeedInMetersPerSecond: number;
  percentageCompleted: number;
  snapshotThumbnails: unknown[]; // unknown?
  overriddenFitnessPrivate: string; // "USE_DEFAULT"
  notableMoments: Array<{
    notableMomentTypeId: number;
    activityId: number;
    incidentTime: number;
    priority: number;
    aux1: string;
    aux2: string;
  }>;
  fitnessData: {
    status: string; // "AVAILABLE"
    fullDataUrl: string; // path to download .fit file
    smallDataUrl: string;
  };
  rideOnTimes: number[]; // number in seconds
  socialInteractions: Array<{
    profile: {
      id_str: string;
      id: number;
      publicId: string; // uuid
      firstName: string;
      lastName: string;
      imageSrc: string;
      imageSrcLarge: string;
      countryCode: number;
      playerType: string; // "NORMAL"
      socialFacts: {
        followerStatusOfLoggedInPlayer: string; // "IS_FOLLOWING"
        isFavoriteOfLoggedInPlayer: boolean;
      };
    };
    proximityTimeScore: number;
    timeDuration: number;
  }>;
  eventInfo?: {
    id: number;
    eventSubGroupId: number;
    imageUrl: string;
    name: string;
    durationInSeconds: number;
    distanceInMeters: number;
    laps: number;
    sport: string; // "CYCLING"
    followeeEntrantCount: number;
    subgroupTotalEntrantCount: number;
    subgroupEventLabel: number;
    eventSubgroups: Array<{
      id: number;
      name: string;
      label: number;
    }>;
  };
  profileFtp: number; // watts
  profileMaxHeartRate: number;
  subgroupResults: {
    topResults: ZwiftActivityAthleteResult[];
    nearPlayerResults: ZwiftActivityAthleteResult[];
  };
  clubId: string; // uuid
  clubAttributions: unknown[]; // unknown?
};
export type ZwiftActivityAthleteResult = {
  profile: {
    id_str: string;
    id: number;
    publicId: string; // uuid
    firstName: string;
    lastName: string;
    imageSrc: string;
    imageSrcLarge: string;
    countryCode: number;
    playerType: string; // "NORMAL"
  };
  durationInMilliseconds: number;
  segmentDistanceInCentimeters: number;
  weightInGrams: number;
  avgWatts: number;
  avgHeartRate: number;
  rank: number; // finish position
  rankingValue: number;
  rankingValueWinnerDifference: number;
  timePenaltyMs: number | null;
  activityId: number;
  activityId_str: string;
  powerType: string; // "POWER_METER"
};

// Return From
// /api/game_info
export type ZwiftGameInfo = {
  gameInfoHash: string;
  maps: ZwiftGameInfoMap[];
  schedules: ZwiftGameInfoSchedule[];
  achievements: ZwiftGameInfoResources[];
  unlockableCategories: ZwiftGameInfoResources[];
  missions: unknown[]; // unknown?
  challenges: ZwiftGameInfoResources[];
  jerseys: ZwiftGameInfoResources[];
  notableMomentTypes: ZwiftGameInfoNotableMomentType[];
  trainingPlans: ZwiftGameInfoResources[];
  bikeFrames: ZwiftGameInfoBikeFrame[];
  segments: ZwiftGameInfoSegment[];
};
export type ZwiftGameInfoResources = {
  id: number;
  name: string;
  imageUrl: string;
};
export type ZwiftGameInfoMap = {
  name: string; // "NEWYORK"
  routes: ZwiftGameInfoMapRoute[];
};
export type ZwiftGameInfoMapRoute = {
  name: string;
  id: number;
  distanceInMeters: number;
  distanceInMetersFromEventStart: number;
  ascentInMeters: number;
  locKey: string; // "LOC_ROUTE_NEWYORK_THE_HIGHLINE"
  imageUrl: string;
  levelLocked: number; // 1
  publicEventsOnly: boolean;
  supportedLaps: true,
  leadinAscentInMeters: number;
  leadinDistanceInMeters: number;
  meetupLeadinAscentInMeters: number;
  meetupLeadinDistanceInMeters: number;
  freeRideLeadinAscentInMeters: number;
  freeRideLeadinDistanceInMeters: number;
  blockedForMeetups: number;
  xp: number;
  duration: number;
  difficulty: number;
  sports: string[]; // "CYCLING" "RUNNING"
};
export type ZwiftGameInfoSchedule = {
  map: string; // "SCOTLAND"
  start: string; // "2023-10-01T04:01:00Z"
};
export type ZwiftGameInfoNotableMomentType = {
  id: number;
  name: string;
  listImageUrl: string;
  mapImageUrl: string;
  priority: number;
};
export type ZwiftGameInfoBikeFrame = {
  id: number;
  name: string;
};
export type ZwiftGameInfoSegment = {
  archFriendlyName: string;
  archFriendlyFemaleName: string;
  id: number;
  archId: number;
  direction: string; // "forward" "reverse",
  roadId: number;
  roadTime: number;
  world: number;
  jerseyName: string;
  jerseyIconPath: string; // "UI/WhiteOrangeTheme/HUD/OrangeJersey_Icon.tga",
  onRoutes: number[];
};

// Return From
// /api/profiles/${athleteId}/followers
// /api/profiles/${athleteId}/followees
export type ZwiftAthleteFollow = {
  id: number;
  followerId: number;
  followeeId: number;
  status: string; // "IS_FOLLOWING",
  isFolloweeFavoriteOfFollower: boolean;
  followerProfile: ZwiftShortProfile | null; // populated for /followers
  followeeProfile: ZwiftShortProfile | null; // populated for /followees
};

// Return From
// /api/notifications
export type ZwiftNotification = {
  id: number;
  fromProfile: null | {
    id: number;
    publicId: string; // uuid
    firstName: string;
    lastName: string;
    imageSrc: string;
    imageSrcLarge: string;
    socialFacts: {
      followerStatusOfLoggedInPlayer: string; // "NO_RELATIONSHIP"
      followeeStatusOfLoggedInPlayer: string; // "IS_FOLLOWING"
      favoriteOfLoggedInPlayer: boolean;
    };
  };
  type: string // "POST_ACTIVITY_RIDE_ONS"
  read: boolean,
  readDate: string | null;
  createdOn: string; // "2023-10-25T01:23:59.928+0000"
  lastModified: string | null;
  activity: {
    id_str: string;
    id: number;
    profileId: number;
    worldId: number;
    name: string;
    privateActivity: boolean;
    sport: string; // "CYCLING"
    startDate: string; // "2023-10-24T23:08:36.323+0000"
    endDate: string; // "2023-10-25T00:13:07.805+0000"
    lastSaveDate: string; // "2023-10-25T00:13:07.805+0000"
    autoClosed: boolean;
    duration: string; // "1:4"
    distanceInMeters: number;
    totalElevation: number;
    avgWatts: number;
    rideOnGiven: boolean;
    activityRideOnCount: number;
    activityCommentCount: number;
    calories: number;
    movingTimeInMs: number;
    privacy: "PUBLIC",
    activityRideOns: unknown[]; // unknown?
    avgHeartRate: number;
    maxHeartRate: number;
    maxWatts: number;
    avgCadenceInRotationsPerMinute: number;
    maxCadenceInRotationsPerMinute: number;
    avgSpeedInMetersPerSecond: number;
    maxSpeedInMetersPerSecond: number;
    percentageCompleted: number;
    overriddenFitnessPrivate: string; // "USE_DEFAULT"
  },
  argLong0: number;
  argLong1: number;
  argString0: string;
};
