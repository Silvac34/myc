#To install Node.js wich is necessary to use NPM
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install
sudo bower install

#To install Mongodb
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo apt-get install -y mongodb-org-shell
sudo apt-get install -y mongodb-org-tools

#To install Redis (broker for celery)
#sudo pip install redis
#sudo apt-get install redis-server peut être pas besoin avec l'addon d'heroku

#Create the addon for redis (broker for celery)
#heroku addons:create heroku-redis -a sushi

#To install celery
#sudo pip install celery

#To install all the Python dependencies
sudo apt-get install -y python-pip
sudo pip install -r requirements.txt

#install heroku
wget -O- https://toolbelt.heroku.com/install-ubuntu.sh | sh
