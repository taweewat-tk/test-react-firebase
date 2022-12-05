import {
  collection,
  addDoc,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { useEffect, useState } from "react";
import { db, storage } from ".";
import "./App.css";

type FileType = {
  name: any;
  file: any;
};

function App() {
  const [data, setData] = useState<DocumentData[]>([]);
  const [docId, setDocId] = useState("");
  const [file, setFile] = useState<FileType>({} as FileType);
  const [progressPercent, setProgressPercent] = useState(0);
  const [downloadLink, setDownloadLink] = useState("");
  const [imagesArray, setImagesArray] = useState<string[]>([]);
  console.log("🚀 ~ file: App.tsx ~ line 28 ~ App ~ imagesArray", imagesArray);
  console.log("🚀 ~ file: App.tsx ~ line 19 ~ App ~ file", file);
  console.log("🚀 ~ file: App.tsx ~ line 8 ~ App ~ docId", docId);
  const get = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "cities"));
      let tempData = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      setData(tempData);
    } catch (error) {
      console.error("Error getting documents: ", error);
    }
  };
  const onFileChange = (event: any) => {
    const fileArry = [];
    fileArry.push(event.target.files);
    console.log(
      "🚀 ~ file: App.tsx ~ line 47 ~ onFileChange ~ fileArry",
      fileArry
    );
    const imgArray = [];
    for (let i = 0; i < fileArry[0].length; i++) {
      imgArray.push(URL.createObjectURL(fileArry[0][i]));
    }
    setImagesArray(imgArray);
    const file = {
      name: event.target.files[0].name,
      file: event.target.files[0],
    };
    setFile(file);
  };
  const preview = () => {
    getDownloadURL(ref(storage, "files/ong.png"))
      .then((url) => {
        // `url` is the download URL for 'images/stars.jpg'

        // This can be downloaded directly:
        // const xhr = new XMLHttpRequest();
        // xhr.responseType = "blob";
        // xhr.onload = (event) => {
        //   const blob = xhr.response;
        // };
        // xhr.open("GET", url);
        // xhr.send();

        // Or inserted into an <img> element
        setDownloadLink(url);
        setTimeout(() => {
          const img = document.getElementById("myimg");
          img?.setAttribute("src", url);
        }, 0);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const onCreate = (values: any) => {
    values.preventDefault();
    const data = values;
    console.log("🚀 ~ file: App.tsx ~ line 36 ~ onCreate ~ data", data);

    const storageRef = ref(storage, `files/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file.file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgressPercent(progress);
      },
      (error) => {
        alert(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setDownloadLink(downloadURL);
          // const img = document.getElementById("myimg");
          // img?.setAttribute("src", downloadURL);
        });
      }
    );
  };
  const create = async () => {
    try {
      const docRef = await addDoc(collection(db, "cities"), {
        name: "Tokyo",
        country: "Japan",
      });
      console.log("Success to created! Document written with ID: ", docRef.id);
      setDocId(docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };
  const update = async (values: any) => {
    values.preventDefault();
    const docId = values.target[0].value;
    console.log("🚀 ~ file: App.tsx ~ line 22 ~ update ~ docId", docId);
    try {
      // ! use setDoc to force document id
      // await setDoc(doc(db, "cities", docId), {
      //   name: "Los Angeles",
      //   state: "CA",
      //   country: "USA",
      // });
      // ! Update data in firebase
      const frankDocRef = doc(db, "cities", docId);
      await updateDoc(frankDocRef, {
        name: "Los Angeles",
        state: "CA",
        country: "USA",
      });
      console.log("Success to updated!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };
  const remove = async (values: any) => {
    values.preventDefault();
    const docId = values.target[0].value;
    try {
      await deleteDoc(doc(db, "cities", docId));
      console.log("Success to removed! ");
    } catch (error) {
      console.error("Error removing document: ", error);
    }
  };
  useEffect(() => {
    get();
  }, []);
  return (
    <div className="container mx-auto">
      <div className="text-center text-4xl mt-4">Test FBase App</div>
      <div className="mt-4">
        <h1>Get Section</h1>
        <div>Preview Image</div>
        {downloadLink && <img id="myimg" alt="myimg" />}
        <button
          onClick={preview}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="button"
        >
          Preview
        </button>
        <div>Preview Mutiple Images</div>
        <div className="form-group multi-preview">
          {imagesArray.map((url) => {
            return <img src={url} alt="test" />;
          })}
        </div>
        <div>Data processing :</div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="text-right text-base font-medium text-blue-700 dark:text-blue-500">
          Uploading... {progressPercent}%
        </div>
        <div>
          Link to Download : <a href={downloadLink}>{downloadLink}</a>
        </div>
        <div>Data: {JSON.stringify(data)}</div>
      </div>
      <div className="mt-4">
        <h1>Add Section</h1>
        <div className="w-full max-w-xs">
          <form
            onSubmit={onCreate}
            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          >
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="username"
              >
                Document ID :
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="documentId"
                type="text"
                placeholder="ID ..."
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="username"
              >
                Image Uploader :
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="imgeFile"
                onChange={onFileChange}
                type="file"
                placeholder="File ..."
                multiple
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Create
              </button>
              <button
                className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                type="submit"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
        <button
          onClick={() => create()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add
        </button>
      </div>
      <div className="mt-4">
        <h1>Update Section</h1>
        <div className="w-full max-w-xs">
          <form
            onSubmit={update}
            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          >
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="username"
              >
                Document ID :
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="documentId"
                type="text"
                placeholder="ID ..."
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Update
              </button>
              <button
                className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                onClick={() => setDocId("")}
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
      <div>
        <h1>Remove Section</h1>
        <div className="w-full max-w-xs">
          <form
            onSubmit={remove}
            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          >
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="username"
              >
                Document ID :
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="documentRemoveId"
                type="text"
                placeholder="ID ..."
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Remove
              </button>
              <button
                className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                onClick={() => setDocId("")}
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
