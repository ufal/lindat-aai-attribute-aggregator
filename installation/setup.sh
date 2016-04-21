#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
IDIR=/opt/aagregator
mkdir -p $IDIR

echo "Installing basic goodies"
cd $IDIR
apt-get -qq install -y curl

echo "Installing node5.XX"
cd $IDIR
curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash - > /dev/null
sudo apt-get -qq install -y nodejs

echo "Installing pm2"
cd $IDIR
sudo npm install pm2 -g

echo "Installing SOLR into $IDIR"
cd $IDIR
PACKAGE=solr-6.0.0
curl -o solr.tgz http://tux.rainside.sk/apache/lucene/solr/6.0.0/$PACKAGE.tgz > /dev/null
tar -xvf solr.tgz
cp -R $PACKAGE/example $IDIR/installation
cd $IDIR/installation
rm -rf collection* data
cp $DIR/solr_schema.xml conf/schema.xml

echo "Installing aai backend into $IDIR"
cd $IDIR
PROJ=aagreg-backend
git clone git@github.com:ufal/lindat-aai-attribute-aggregator-backend.git $PROJ


echo "Running all applications through pm2"
cd $DIR
sudo pm2 startup pm2.apps.json

# http://pm2.keymetrics.io/docs/usage/quick-start/
echo "Make pm2 persistent during restarts"
sudo pm2 startup
