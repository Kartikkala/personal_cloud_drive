# 🖼️ Mirror Website

This is an app for creating mirrors. The app uses aria2 API for downloading files onto server and host them directly from there. Cloud drives are not compulsory but are available. Streaming options are also available for videos, so that you could download videos onto server and stream them anywhere, anytime, without downloading. This project is currently not completed and can just host the files, which are already present on the server. Other features are also yet to come...

## 🚀 Getting Started

### First way - By cloning repository and building docker image

To get started with the project, follow these steps:

1. Clone the repository: `git clone https://github.com/Kartikkala/mirror_website.git`
2. Install Docker on your machine if you haven't already: https://www.docker.com/get-started
3. Navigate to the project directory: `cd mirror_website`
4. Run `docker build -t <image_name> . --no-cache` command to build the image with your preffered `image_name`.
5. Run `docker run -p 80:80 -d --mount type=bind,src=path/to/volume,dst=/downloadables <image_name>` with root previliges (if using linux) where `path/to/volume` is the path from which all the files (videos, pictures or other files ) will be hosted on the website. .
6. If you are doing this locally, then open localhost in your browser or.
7. If you are using any remote server, then type server IP in your browser.
8. The files present in the `path/to/volume` must be shown in the browser.

### Second way - By directly downloading prebuilt docker images

Prebuilt docker images are also available for this project, you can directly download them instead of cloning the repo and run them. To do this, follow these steps:

1. Install docker on your machine.
2. Pull the docker image using this command - `docker pull kartikkala/mirror_website`.
3. Run the image using - `docker run -p 80:80 -d --mount type=bind,src=path/to/volume,dst=/downloadables kartikkala/mirror_website:latest`, where `path/to/volume` is the path from which all the files (videos, pictures or other files ) will be hosted on the website. 
4. The files present in the `path/to/volume` must be shown in the browser.


## 🤝 Contributions

Contributions are welcome! If you find a bug or want to add a new feature, feel free to create a pull request.


## 📧 Contact

[![LinkedIn](https://img.shields.io/badge/-LinkedIn-0077B5?style=for-the-badge&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/kartik-kala-90aa6b235)
[![Twitter](https://img.shields.io/badge/-Twitter-1DA1F2?style=for-the-badge&logo=Twitter&logoColor=white)](https://twitter.com/KARTIKKALA10)
[![Gmail](https://img.shields.io/badge/-Gmail-D14836?style=for-the-badge&logo=Gmail&logoColor=white)](mailto:kartikkala10december@gmail.com)
[![Telegram](https://img.shields.io/badge/-Telegram-2CA5E0?style=for-the-badge&logo=Telegram&logoColor=white)](https://telegram.me/Kartikkala)
 
