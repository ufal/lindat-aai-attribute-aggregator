# Attribute aggregator

In the world of *academic* identity (inter-)federations, the `release attribute problem` is often mentioned. The problem is that Service Providers (SPs) do not get the attributes from Identity Providers (IdPs) they need.

## TL;DR

Have you ever experienced that a user could `not` authenticate (authorise) to your SP? If not then you are probably doing something wrong ;). 
`If you participate, then AAI people from CLARIN will contact IdPs on behalf of the SPs making the SP admin life easier *and* making the CLARIN SPs more usable.`

We do it by collecting  the `names` of attributes (no values!) that have been released to a SP.

See https://github.com/ufal/clarin-sp-aaggregator for the software (script) that must be installed on the SP.

Our latest experience show, that there has been a very positive shift on the federation/IdP admin side and the people are trying to be constructive.


## Simplified description of the problems

Almost everyone who talks about the problem does so without any real data or statistics. This attribute aggregator is the next version of our local attribute aggregator allowing any SP (well, only the invited ones for the moment) to take part. 

There are many reasons for that but mostly the IdP admins do not have the right or do not want to take responsibility for releasing information about users. The problem is (was made!) pretty complicated, depends on the state you are in and its specific laws, depends on your lawyer views, your federation operator views etc. At the moment (2016), there are two (three?) attempts to address this issue: 
* Data Protection Code of Conduct (CoCo) - http://geant3plus.archive.geant.net/uri/dataprotection-code-of-conduct/V1/Pages/default.aspx;
* Research&Scholarship Entity Category (R&S) - https://refeds.org/category/research-and-scholarship;
* attribute release consent screen (Consent Screen).
 
Even though we may not like it, it seems that the first one is more Europe oriented and the second one more USA oriented. Moreover, the federations themselves must explicitly support either CoCo or R&S which is not that common. There seems to be an ongoing discussion whether the Consent Screen is "more" than just being a bit nicer to the user - some lawyers? think that the consent was forced...

The CoCo was prepared with lawyers and should (based on those lawyers) be binding to the SP making the IdP feel a bit more safe. This means that the SP will behave nicely to the attributes it gets and the IdP should provide those attributes. (*But the IdP can choose what is the list of supported attributes...*)

R&S defines an attribute bundle that the IdPs should release. (*The question is, who should be responsible for assigning that entity category*)

There is (much) more to it:
* SPs cannot specify requested attributes well enough (no boolean operators) making CoCo a bit problematic;
* specifying attributes that should be released was made a mayhem in the context of optional vs mandatory vs CoCo vs R&S;
  * federation communities (REFEDs, eduGAIN) is so diverse that everything is a problem;
* eppn can be reassigned in general (R&S has this covered);
* we are even not talking about the values that are released.

Much more information should be here but the above is, I think, quite illustrative.

# Installation and Technical details

## Requirements

- node.js
- web server (nginx)
- solr

## Installation

See installation/setup.sh or manually install `solr`, `node`, clone this repository, install `npm` modules, install web server (+ssl and proxy),
 link to ./www, link to ./settings from www, start the backend.


# New dev related

## Vagrant

Do a `vagrant up` to see all in action.

## Obsolete - use pm2

Deploy to your production machine using (see `installation/setup.sh`)
```
git remote add deploy user@deployed machine:deploy dir
git push deploy master
```

## pm2 deploy

See pm2.json and pm2 deploy tutorials.

Add node user on ubuntu*
```
useradd node
```
disable password login for node user in sshd_config, add permissions to pm2.


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
