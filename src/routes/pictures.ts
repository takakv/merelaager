export const renderPictures = (req, res, meta, imageList) => {
  res.render("pildid", {
    title: meta.pildid.title,
    description: meta.pildid.description,
    url_path: "pildid/",
    body_class: "pildid",
    imageList: imageList
  });
};
