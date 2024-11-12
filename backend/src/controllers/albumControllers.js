import { Album } from "../models/albumModel.js";


export async function getAllAlbums(req, res, next) {
    try {
        const albums = await Album.find();
        res.status(200).json(albums);
    } catch (error) {
        next(error);
    }
};

export async function getAlbumById(req, res, next) {
    try {
        const { albumId } = req.params;

        const album = await Album.findById(albumId).populate("songs");

        if(!album) {
            return res.status(404).json({ error: "Album not found" })
        }

        res.status(200).json(album);
    } catch (error) {
        next(error);
    }
}