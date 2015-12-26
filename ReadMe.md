First you have to download vagrant at http://vagrantup.com
Once it is downloaded and on your PATH, execute the following command in
the project's directory

vagrant up

To connect to the vagrant VM you just launched, enter the following command
vagrant ssh

Once in the VM, type the following to go to your project root directory within the VM
cd /vagrant

To start Mongodb
sudo service mongod start

If you want to deploy the app to heroku:
1) Make sure you install heroku and have heroku on your PATH

heroku create

git push heroku master

You're good to go!!!!
