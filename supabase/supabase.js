import { createClient } from '@supabase/supabase-js';
import mime from 'mime-types';
import 'dotenv';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const createBucket = async (userID) => {
  const result = await supabase
                        .storage
                        .createBucket(`user-${userID}`);
  /*
  const { data, error } = await supabase.rpc("create_user_file_policy", { bucket_id: `user-${userID}` });
  if (error) {
    console.error("error: ", error);
  } else {
    console.log(data);
  }*/
  return result;
};

const createFile = async (userID, filename, buffer) => {
  const mimeType = mime.lookup(filename) || 'application/octet-stream';
  const result = await supabase
                        .storage
                        .from(`user-${userID}`)
                        .upload(filename, buffer, { upsert: true, contentType: mimeType });

  return result;
};

const getFilesFromUser = async (userID) => {
  const result = await supabase
                        .storage
                        .from(`user-${userID}`)
                        .list();

  if (result.error) {
    throw result.error;
  }

  return result.data;
};

const getFileFromUser = async (userID, filename) => {
  const result = await supabase
                        .storage
                        .from(`user-${userID}`)
                        .list("", { search: filename });

  if (result.error) {
    throw result.error;
  }

  return result.data;
};

const deleteFilesFromUser = async (userID, files) => {
  const result = await supabase
                        .storage
                        .from(`user-${userID}`)
                        .remove(files);

  if (result.error) {
    throw result.error;
  }

  return result.data;
};

const downloadFileFromUser = async (userID, filename) => {
  const result = await supabase
                        .storage
                        .from(`user-${userID}`)
                        .download(filename);

  if (result.error) {
    throw result.error;
  }

  return result.data;
};

export default {
  supabase,
  createBucket,
  createFile,
  getFilesFromUser,
  getFileFromUser,
  deleteFilesFromUser,
  downloadFileFromUser,
};
