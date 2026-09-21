const rolePermissions = {
  ADMIN: [
    "/",
    "/map",
    "/incidents",
    "/damage-analysis",
    "/reports",
    "/routes",
    "/resources",
    "/protocols",
    "/users",
  ],

  INCIDENT_COMMANDER: [
    "/",
    "/map",
    "/incidents",
    "/reports",
    "/routes",
    "/resources",
    "/protocols",
  ],

  RESPONSE_TEAM: [
    "/",
    "/map",
    "/incidents",
    "/routes",
    "/resources",
  ],

  ANALYST: [
    "/",
    "/map",
    "/damage-analysis",
    "/reports",
  ],

  VIEWER: [
    "/",
    "/map",
    "/reports",
  ],
};

export default rolePermissions;