# Attribute aggregator

See https://github.com/ufal/clarin-sp-aaggregator for the software that must be installed on the SP.

## Requirements

- node.js
- web server
- solr

## Installation

See installation/setup.sh or manually install node, clone this repository, install npm modules, install web server (+ssl),
 link to ./www, start the backend.


# New dev related

## Vagrant

Do a `vagrant up` to see all in action.

##

Deploy to your production machine using (see `installation/setup.sh`)
```
git remote add deploy user@deployed machine:deploy dir
git push deploy master
```

## Install new modules and save them to package.json

```
npm install --save XXX
```
or
```
npm install --save-dev XXX
```

## Update modules

```
npm install -g npm-check-updates
npm-check-updates -u
npm install 
```