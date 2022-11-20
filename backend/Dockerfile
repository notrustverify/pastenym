# Create ubuntu as base image
FROM python

# Install packages
#RUN ["apt-get", "update", "-y"]
#RUN ["apt-get", "install","vim", "python3", "python3-pip",  "ca-certificates" ,"curl", "gnupg" ,"lsb-release", "git" ,"-y"]
RUN ["pip", "install", "pipenv"]
COPY . .
RUN ["pipenv", "install", "--system", "--deploy","--ignore-pipfile" ]
ENV PYTHONUNBUFFERED 1
CMD ["python", "main.py"]
