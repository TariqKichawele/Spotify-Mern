import cloudinary from "../lib/cloudinary.js";
import { Song } from "../models/songModel.js";
import { Album } from "../models/albumModel.js";

const uploadToCloudinary = async (file) => {
    try {
        const res = await cloudinary.uploader.upload(file.tempFilePath, {
            resource_type: "auto"
        });

        return res.secure_url;
    } catch (error) {
        console.log(error, "Error in uploadToCloudinary");
        throw new Error("Cloudinary upload failed");
    }
};

export const createSong = async (req, res, next) => {

   try {
    if(!req.files || !req.files.audioFile || !req.files.imageFile) {
        return res.status(400).json({ error: "Missing audioFile or imageFile" })
    };

    const { title, artist, albumId, duration } = req.body;
    const audioFile = req.files.audioFile;
    const imageFile = req.files.imageFile;

    const audioUrl = await uploadToCloudinary(audioFile);
    const imageUrl = await uploadToCloudinary(imageFile);

    const song = await Song.create({
        title,
        artist,
        albumId: albumId || null,
        audioUrl,
        imageUrl,
        duration
    });

    await song.save();

    if(albumId) {
        await Album.findByIdAndUpdate(albumId, {
            $push: {
                songs: song._id
            }
        })
    };

    res.status(201).json({ success: true, song });
   } catch (error) {
    console.log(error, "Error in createSong");
    next(error);
   } 
}

export const deleteSong = async (req, res, next) => {
    try {
        const { id } = req.params;

        const song = await Song.findById(id);

        if(song.albumId) {
            await Album.findByIdAndUpdate(song.albumId, {
                $pull: {
                    songs: song._id
                }
            })
        };

        await Song.findByIdAndDelete(id);

        res.status(200).json({ success: true });
    } catch (error) {
        console.log(error, "Error in deleteSong");
        next(error);
    }
}

export const createAlbum = async (req, res, next) => {
    try {
        const { title, artist, releaseYear } = req.body;
        const  { imageFile } = req.files;

        const imageUrl = await uploadToCloudinary(imageFile);

        const album = await Album.create({
            title,
            artist,
            imageUrl,
            releaseYear
        });

        await album.save();

        res.status(201).json({ success: true, album });
    } catch (error) {
        console.log(error, "Error in createAlbum");
        next(error);
    }
};

export const deleteAlbum = async (req, res, next) => {
    try {
        const { id } = req.params;
        await Song.deleteMany({ albumId: id });
        await Album.findByIdAndDelete(id);
        res.status(200).json({ success: true });
    } catch (error) {
        console.log(error, "Error in deleteAlbum");
        next(error);
    }
};

export const checkAdmin = async (req, res, next) => {
    res.status(200).json({ admin: true });
}

