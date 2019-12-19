// ESM syntax is supported.
export {}

const http = require('request-promise-native');
const config = require('./config.json');
const fs = require('fs-extra');

const cache = fs.readJsonSync('./cache.json', { throws: false }) || {};
const cachedIp = cache.ip || '';

const headers = () => {
    return {
        'Authorization': `sso-key ${config.key}:${config.secret}`,
        'Content-Type': 'application/json'
    };
};

const buildRecordRequest = (domain, type, name) => {
    return {
        url: `https://api.godaddy.com/v1/domains/${domain}/records/${type}/${name}`,
        headers: headers()
    }
};

const buildDomainRequest = (domain) => {
    return {
        url: `https://api.godaddy.com/v1/domains/${domain}/records`,
        headers: headers()
    }
};

const retrieveAll = () => {
    const result = {};
    const promises = [];
    for (const entry of config.entries) {
        result[entry.domain] = [];
        promises.push(http.get(buildDomainRequest(entry.domain)).then(response => {
            const responseObj = JSON.parse(response);
            entry.entries.forEach(function (domainEntry) {
                const match = responseObj.find(e => e.name === domainEntry.name);
                if (match) {
                    result[entry.domain].push(match);
                }
            })
        }))
    }
    return Promise.all(promises).then(() => result);
};


const updateIp = (domains, ip) => {
    const promises = [];
    Object.entries(domains).forEach(([domain, domainEntries]) => {
        domainEntries.forEach(entry => {
            const payload = [Object.assign(entry, { data: ip })];
            const request = Object.assign(buildRecordRequest(domain, entry.type, entry.name), { body: JSON.stringify(payload) });
            promises.push(http.put(request).then(() => {
                console.log(`SET ${entry.type} ${entry.name}.${domain} => ${ip}`);
                syncCachedIp(ip);
            }));
        })
    });
    return Promise.all(promises);
};
//
const syncCachedIp = (ip) => {
    fs.writeJsonSync('./cache.json', { ip: ip })
};

const filterUpdatedIps = (domains, ip) => {
    var filtered = {};
    Object.entries(domains).forEach(([domain, entries]) => {
        const clean = entries.filter(e => e.data !== ip);
        if (Array.isArray(clean) && clean.length > 0) {
            filtered[domain] = clean;
        }
    });
    return filtered;
};

http.get('http://api.ipify.org')
    .then(currentIp => {
        if (currentIp === cachedIp) {
            console.log('current ip matches cached ip, no need to update.');
            return;
        }
        return retrieveAll()
            .then(godaddyIps => {
                const filtered = filterUpdatedIps(godaddyIps, currentIp);
                if (!Object.keys(filtered).length) {
                    console.log('godaddy ip matches current ip, updating cached ip and doing nothing.');
                    syncCachedIp(currentIp);
                    return;
                }
                return updateIp(filtered, currentIp);

            }).then(() => {
                console.log("Finished!");
            })
    }).catch(console.log);
