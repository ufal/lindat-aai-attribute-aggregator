#!/usr/bin/env bash

ip=`LANG=c ifconfig eth1 | grep "inet addr" | awk -F: '{print $2}' | awk '{print $1}'`
PREF="\n\n==========================\n"
DIR=/opt/aaggregator/installation
IDIR=/opt/aaggregator
mkdir -p $IDIR
PROJ=aaggreg
PROJDIR=$IDIR/$PROJ
DEPLOYDIR=$IDIR/deploy/$PROJ.git
export SOLRURL=http://127.0.0.1:8983

echo -e $PREF "Installing basic goodies"
cd $IDIR
apt-get -qq install -y curl git htop nginx > /dev/null

echo -e $PREF "Installing node5.XX"
cd $IDIR
curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash - > /dev/null
sudo apt-get -qq install -y nodejs


echo -e $PREF "Installing pm2"
cd $IDIR
sudo npm install pm2 -g > /dev/null


echo -e $PREF "Installing openjdk-java8"
sudo add-apt-repository -y ppa:openjdk-r/ppa
sudo apt-get update > /dev/null
sudo apt-get -qq install -y openjdk-8-jdk > /dev/null
sudo update-alternatives --config java > /dev/null
sudo update-alternatives --config javac > /dev/null


echo -e $PREF "Installing SOLR into $IDIR"
cd $IDIR
PACKAGE=solr-6.0.0
curl -s -o solr.tgz http://tux.rainside.sk/apache/lucene/solr/6.0.0/$PACKAGE.tgz
tar -xf solr.tgz
SOLR=$IDIR/solr
mv $IDIR/$PACKAGE $SOLR
mkdir -p $SOLR/installation
cp -R $DIR/solr_installation/* $SOLR/installation/ 2>/dev/null


echo -e $PREF "Installing aai backend into $IDIR"
cd $IDIR
git clone https://github.com/ufal/lindat-aai-attribute-aggregator.git $PROJ
cd $PROJ
npm install


echo -e $PREF "Running all applications through pm2 - from $DIR/pm2.apps.json"
cd $DIR
sudo pm2 start pm2.apps.json

# http://pm2.keymetrics.io/docs/usage/quick-start/
echo -e $PREF "Make pm2 persistent during restarts"
sudo pm2 startup > /dev/null

# basic tests
sleep 15
curl -s "$SOLRURL/solr/admin/info/system?wt=json&indent=true" | python -c 'import sys, json; js=json.load(sys.stdin); del js["jvm"]["jmx"]; print json.dumps(js, indent=4)'

# nginx
echo -e $PREF "Setting up nginx"
mkdir -p /var/www/
ln -s $PROJDIR/www /var/www/html
rm -f /etc/nginx/sites-enabled/*
cp $DIR/nginx/* /etc/nginx/sites-enabled/
service nginx reload
sudo update-rc.d nginx defaults

# now we can fiddle with deployment
echo -e $PREF "Setting up automated deployment"
cd $IDIR
mkdir -p deploy && cd deploy
git clone --bare /opt/aaggregator/aaggreg/ aaggreg.git
cp $DIR/deploy/* $DEPLOYDIR/hooks/
chmod +x $DEPLOYDIR/hooks/*


# happy work
echo -e $PREF "You should find these services available\nSOLR: $SOLRURL or http://localhost:8983/\naaggreg: http://$ip/aaggreg/ or http://127.0.0.1:3001/\nwww: http://$ip/"
echo -e $PREF "Automated deployment like this\ngit remote add deploy user@$ip:$DEPLOYDIR\ngit push deploy master"