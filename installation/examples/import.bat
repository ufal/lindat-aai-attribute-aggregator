curl "http://localhost:8983/solr/loginx/update?commit=true" --data-binary @few.docs.json -H 'Content-type:application/json'
curl "http://localhost:8983/solr/entities/update?commit=true" --data-binary @few.docs.entities.json -H 'Content-type:application/json'
