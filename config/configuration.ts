export const configuration = () => ({
  app: {
    appName: process.env.APP_NAME || 'BACKEND_API',
    serviceName: process.env.SERVICE_NAME || 'App Service',
    port: process.env.PORT || 7000,
    environment: process.env.NODE_ENV || 'development',
    encryptionKey: process.env.SERVER_SECRET || 'AppSecret',
    jwtExpiration: process.env.JWT_EXPIRATION || 172800,
    baseUrl:
      process.env.BASE_URL || `http://localhost:${process.env.PORT || 7000}`,
    // Default verification code for development only - set DEFAULT_VERIFY_CODE env var in production
    defaultVerifyCode: process.env.DEFAULT_VERIFY_CODE || (process.env.NODE_ENV === 'production' ? undefined : '123456'),
    pagination: {
      itemsPerPage: 10,
    },
    currencies: ['NGN', 'USD', 'EUR', 'GBP'],
    fromEmail: process.env.FROM_EMAIL || 'noreply@starter-api.com',
    templates: {
      email: {
        verify: process.env.EMAIL_TEMPLATE_VERIFY || 'verify-email',
        resetPassword: process.env.EMAIL_TEMPLATE_RESET_PASSWORD || 'reset-password',
      },
      sms: {
        verify: process.env.SMS_TEMPLATE_VERIFY || 'verify-sms',
      },
    },
    social: {
      facebook: {
        GraphUrl: process.env.FACEBOOK_GRAPH_URL || 'https://graph.facebook.com/me?fields=id,name,email,first_name,last_name',
      },
      google: {
        url: process.env.GOOGLE_USER_INFO_URL || 'https://www.googleapis.com/oauth2/v3/userinfo',
      },
    },
    lang: 'en',
    domain: process.env.DOMAIN,
    rabbitMQ: process.env.RABBIT_MQ_URL,
    redis: {
      name: 'BACKEND_API-redis',
      url: process.env.REDIS_SERVER_HOST_URL,
    },
    smsProvider: process.env.SMS_PROVIDER,
    mongodb: {
      url: process.env.DB_URL,
      test: process.env.DB_TEST_URL,
    },
    rdbms: {
      default: 'postgres',
      postgres: {
        host: process.env.POSTGRES_DB_HOST,
        port: process.env.POSTGRES_DB_PORT,
        name: process.env.POSTGRES_DB_NAME,
        username: process.env.POSTGRES_DB_USERNAME,
        password: process.env.POSTGRES_DB_PASSWORD,
        ssl: process.env.POSTGRES_DB_SSL === 'true',
      },
    },
  },
  worker: {
    url: process.env.WORKER_SERVICE_URL || '',
    socketPort: process.env.SOCKET_PORT || process.env.PORT || 7010,
    fileUpload: {
      default: process.env.DEFAULT_FILE_STORAGE || 'cloudinary',
      s3: {
        default: process.env.AWS_BASE_URL_PROVIDER || 'test',
        baseUrl: process.env.AWS_BUCKET_BASE_URL || '',
        key: process.env.AWS_ACCESS_KEY,
        secret: process.env.AWS_SECRET_KEY,
        bucket: process.env.AWS_BUCKET,
        region: process.env.AWS_REGION,
      },
      cloudinary: {
        name: process.env.CLOUDINARY_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
        url: process.env.CLOUDINARY_API_URL,
      },
      assetUploadBaseUrl: process.env.ASSET_UPLOAD_BASE_URL,
      assetUploadUrl: process.env.ASSET_UPLOAD_URL,
    },
    email: {
      default: process.env.EMAIL_PROVIDER || 'sendgrid',
      noReply: {
        email: 'no-reply@starter-api.com',
        name: 'starter-api',
        mailOption: 'sendgrid',
      },
      sendgrid: {
        apiKey: process.env.SEND_GRID_API_KEY,
        contactFormRecipient: process.env.CONTACT_FORM_EMAIL_RECIPIENT,
      },
    },
    multitexter: {
      url: process.env.MULTITEXTER_BASE_URL,
      apiKey: process.env.MULTITEXTER_API_KEY,
      senderId: process.env.MULTITEXTER_SENDER_ID,
    },
    pusher: {
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER || 'us2',
      useTLS: true,
    },
    workerServiceToken: process.env.WORKER_SERVICE_TOKEN,
  },
  admin: {
    superUser: {
      email: process.env.ADMIN_EMAIL,
      // IMPORTANT: Always set ADMIN_PASSWORD in production - no default provided for security
      password: process.env.ADMIN_PASSWORD,
    },
  },
  microservices: {
    userService: {
      url: process.env.USER_MICROSERVICE_URL || 'http://localhost:4000/api/v1',
    },
    workerService: {
      url:
        process.env.WORKER_MICROSERVICE_URL || 'http://localhost:4002/api/v1',
    },
    adminService: {
      url: process.env.ADMIN_MICROSERVICE_URL || 'http://localhost:4001/api/v1',
    },
  },
});
