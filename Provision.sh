cd /vagrant
#To install Node.js wich is necessary to use NPM
##curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
##sudo apt-get install -y nodejs
##sudo npm install

#To install Mongodb
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

#To install all the Python dependencies
sudo apt-get update
sudo apt-get install -y python-pip
sudo pip install flask
sudo pip install gunicorn
sudo pip install pymongo

#install heroku
wget -O- https://toolbelt.heroku.com/install-ubuntu.sh | sh
