import { Request, Response } from "express";

export const renderPictures = (
  req: Request,
  res: Response,
  meta: any,
  imageList: object[]
) => {
  res.render("pildid", {
    title: meta.pildid.title,
    description: meta.pildid.description,
    url_path: "pildid/",
    body_class: "pildid",
    imageList: imageList,
  });
};
