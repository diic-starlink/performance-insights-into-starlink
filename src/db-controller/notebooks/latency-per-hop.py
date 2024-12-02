import pandas as pd
from sqlalchemy import create_engine
import pycountry
import json
import matplotlib.pyplot as plt
import matplotlib.ticker as tick
from matplotlib.ticker import FuncFormatter
import numpy as np
import seaborn as sns
import time
import datetime
import duckdb
import ipinfo

access_token = "3c2ecaf3f4ae47"
handler = ipinfo.getHandler(access_token)

# Expects date in format 01.12.1999
def date_to_timestamp(date):
    return int(time.mktime(datetime.datetime.strptime(date, "%d.%m.%Y").timetuple()))

engine = create_engine("postgresql://postgres:postgres@postgres:5432/postgres") # postgresql://user:password@host:port/databasename")

def to_latex(df, columns=None, label="nolabel", caption="notitle"):
    if not columns:
        columns = df.columns.tolist()
    return df.to_latex(index=False, bold_rows=True, label=label, caption=caption, columns=columns)

def country_name(country_iso):
    return pycountry.countries.get(alpha_2=country_iso).name

def filter_for(df, name, value):
    return df.loc[df[name] == value]

def filter_for_unequal(df, name, value):
    return df.loc[df[name] != value]

def filter_for_range(df, name, lower_bound, upper_bound):
    return df[(df[name] >= lower_bound) & (df[name] < upper_bound)]

def days_in_month(year, month):
    return monthrange(year, month)[1]

def first_weekday_of_month(year, month):
    return monthrange(year, month)[0]

def date_to_weekday(day, month, year):
    date = datetime(year, month, day)
    return day_name[date.weekday()]

def shorten_company_name(name):
    if name == 'Space Exploration Technologies Corporation':
        return 'SpaceX'
    if name == 'Reseaux IP Europeens Network Coordination Centre (RIPE NCC)':
        return 'RIPE NCC'
    if name == 'TOTAL PLAY TELECOMUNICACIONES SA DE CV':
        return 'Total Play'
    if name == 'Virtual Technologies & Solutions':
        return 'VTS'
    if name == 'GTT Communications Inc.':
        return 'GTT Comm.'
    if name == 'Hurricane Electric LLC':
        return 'Hurricane El.'
    if name == 'IONOS SE':
        return 'IONOS'
    if name == 'Fiber Telecom S.p.A.':
        return 'Fiber Tel.'
    if name == 'Northwestel Inc.':
        return 'Northwestel'
    if name == 'Philippine Long Distance Telephone Company':
        return 'PLDT'
    if name == 'NTT America, Inc':
        return 'NTT America'
    if name == 'ANEXIA Internetdienstleistungs GmbH':
        return 'ANEXIA'
    if name == 'Deutsche Telekom AG':
        return 'Deutsche Telekom'        
    return name

def aggregate_routes(df, target, hops):
    unparsed_data = filter_for(df, 'msm_id', target)['result'].to_list()
    data = [json.loads(v) for v in unparsed_data]
    
    rtts = [[]]
    for meas in data:
        # Track number of hops per traceroute measurement
        hops[len(meas)] += 1
        
        for i, hop in enumerate(meas):
            results = hop.get('result')
            for r in results:
                if 'x' in r.keys():
                    continue
                rtt = r.get('rtt')
                ip = r.get('from')
                if not rtt:
                    continue
                
                if len(rtts) <= i:
                    rtts.append([(rtt, ip)])
                else:
                    rtts[i].append( (rtt, ip) )
                break
    return rtts

def get_asn(ip):
    details = handler.getDetails(ip).all
    if 'asn' in details.keys():
        asn_details = details.get('asn')
        company_name = shorten_company_name(asn_details.get('name'))
        return f'{asn_details.get("asn")} ({company_name})' 
    return False

def visualize_rtts(data, target, country):
    if target != 5001: return
    
    asns = [[] for _ in range(0, 50)]
    if len(data) == 0: return
    
    rtts = [[v[0]  for v in l] for l in data]
    ips = [[v[1]  for v in l] for l in data]
    for hop, hop_list in enumerate(ips):
        for ip in hop_list:
            asn = get_asn(ip)
            if asn:
                asns[hop].append(asn)
    
    asns_freq = [[] for _ in range(0, 50)]
    for hop, hop_asns in enumerate(asns):
        for asn in set(hop_asns):
            freq = hop_asns.count( asn )
            asns_freq[hop].append( (asn, freq) )
    
    while True:
        if len(asns_freq) == 0: break
        
        last = asns_freq[len(asns_freq) - 1]
        if len(last) == 0:
            asns_freq.pop()
        else:
            break
    
    def millions(x, pos):
        return f'{int(x)} ms'
    formatter = FuncFormatter(millions)
    
    plt.rcParams.update({'font.size': 15})
    
    fig, ax = plt.subplots()
    ax.figure.set_size_inches(10,10)
    ax.set_xlabel('Latency')
    ax.set_ylabel('Hop')
    ax.boxplot(rtts, 0, 'rs', 0, showfliers=False)
    ax.spines[['right', 'top']].set_visible(False)
    ax.xaxis.set_major_formatter(formatter)
    
    plt.gca().invert_yaxis()
    labels = []
    for i in range(0, len(asns_freq)):
        spacer = ''
        if i % 2 != 0:
            spacer = '    '
        
        l = sorted(asns_freq[i], reverse=True)
        if len(l) > 1:
            labels.append(f'{spacer}{l[0][0]}\n{spacer}{l[1][0]}')
        elif len(l) == 1:
            labels.append(f'{spacer}{l[0][0]}')
        else:
            labels.append('')
    
    def ident(x):
        return x
    
    right_ax = ax.secondary_yaxis('right', functions=(ident, ident))
    right_ax.set_yticks(np.arange(1,len(asns_freq)+1), labels, fontsize='xx-small')
    right_ax.set_ylabel('Most frequent ASN(s)')
    
    plt.savefig(f'traceroute/latency-per-hop-{country}-{target}.pdf', bbox_inches='tight')
    plt.show()

def hops_histogram(data, country):
    data = data[:20]
    plt.rcParams.update({'font.size': 10})
    
    fig, ax = plt.subplots()
    fig.set_size_inches(8, 6)
    ax.set_xlabel('Hops')
    ax.set_ylabel('Number of Measurements')
    
    xticks_locations = np.arange(0.5, len(data)+1)
    xticks_labels = [str(int(v)) for v in xticks_locations]
    
    ax.stairs(data, np.arange(0, len(data)+1))
    plt.xticks(xticks_locations, xticks_labels)

    max = np.max(data)
    plt.yticks(np.arange(0, max, 10_000), np.arange(0, max, 10_000))

    ax.spines[['right', 'top']].set_visible(False)
    plt.savefig(f'traceroute/hops_{country}.pdf', bbox_inches='tight')
    plt.show()

probes = duckdb.read_parquet('./parquet/ripe_atlas_probe_data.parquet')
countries = duckdb.sql('SELECT DISTINCT country FROM probes').to_df()['country'].to_list()
traceroute = duckdb.read_parquet('./parquet/traceroute_data.parquet')

country_hops = {}
def hops_for_country(country):
    
    print(country)
    df = duckdb.sql(f"SELECT * FROM traceroute t JOIN probes p ON t.prb_id = p.id WHERE country = '{country}' and destination_ip_responded = True;").to_df()

    hops = [0] * 50
    targets = set(df['msm_id'].to_list())

    country_res = []
    for t in targets:
        res = aggregate_routes(df, t, hops)
        country_res.append( (res, t) )

    country_hops[country] = hops
    return country_res

countries = []
for c in ['US']:
    countries.append(hops_for_country(c))

for c in countries:
    for data, target in c:
        visualize_rtts(data, target, 'US')

for idx, (key, value) in enumerate(country_hops.items()):
    hops_histogram(value, key)
