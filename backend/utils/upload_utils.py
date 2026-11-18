
import cloudinary.uploader
from config import ALLOWED_IMAGE_EXTENSIONS


def allowed_file(filename):
    return (
        filename
        and "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS
    )


def save_image(file, subfolder):
    """
    Uploads an image to Cloudinary.
    Returns both secure URL and public ID.
    """

    if not file or not file.filename or not allowed_file(file.filename):
        raise ValueError("Invalid image file")

    try:
        result = cloudinary.uploader.upload(
            file,
            folder=f"your_app/{subfolder}",
            resource_type="image"
        )

        return {
            "image_url": result["secure_url"],
            "public_id": result["public_id"]
        }

    except Exception as e:
        raise RuntimeError(f"Image upload failed: {str(e)}")


def delete_image(public_id):
    """
    Deletes an image from Cloudinary using its public ID.
    """

    if not public_id:
        return

    try:
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type="image"
        )

        if result.get("result") not in ("ok", "not found"):
            raise RuntimeError(f"Cloudinary deletion result: {result}")

    except Exception as e:
        raise RuntimeError(f"Image deletion failed: {str(e)}")
