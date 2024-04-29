import {
  Query,
  Account,
  Avatars,
  Client,
  ID,
  Databases,
} from "react-native-appwrite";

export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.even.aora",
  projectId: process.env.APP_WRITE_PROJECT_ID,
  databaseId: process.env.APP_WRITE_DB_ID,
  userCollectionId: process.env.APP_WRITE_USER_COLLECTION_ID,
  videoCollectionId: process.env.APP_WRITE_VIDEO_COLLECTION_ID,
  storageId: process.env.APP_WRITE_STORAGE_ID,
};

const client = new Client();

client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setPlatform(config.platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export const createUser = async ({ email, password, username }) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      config.databaseId,
      config.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    throw new Error(error);
  }
};

export const signIn = async ({ email, password }) => {
  try {
    const session = await account.createEmailSession(email, password);

    return session;
  } catch (error) {}
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
};
