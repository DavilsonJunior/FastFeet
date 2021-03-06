import File from '../models/File';

class FileController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;

    const file = await File.create({
      name,
      path,
    }, 
  );

    return res.json({
      id: file.id,
      name: file.name,
      path: file.path,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    });
   }
}

export default new FileController();