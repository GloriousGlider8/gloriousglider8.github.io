function formatMonthYear(input) {
	let [month, year] = input.split('/')
	month = parseInt(month, 10)
	const monthNames = [
		"January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"
	]
	return `${monthNames[month - 1]} ${year}`
}

document.addEventListener("DOMContentLoaded", (e) => {
	const params = new URLSearchParams(window.location.search)

	if (params.get("d") == "true") {
		fetch(`/music/breakdown/${params.get("c")}.collection`)
			.then(r1 => r1.arrayBuffer())
			.then(buf1 => {
				const stream1 = new KaitaiStream(buf1)
				const collection = new Collection(stream1)

				document.getElementById("other-tracks").innerHTML = `Other Songs from ${collection.name}`
				for (const sng of collection.songs) {
					if (sng.id != params.get("s")) {
						const div = document.createElement("div")

						div.classList.add("song-listing")
						div.innerHTML = `<a href="?d=true&c=${params.get("c")}&s=${sng.id}"><img src="/assets/mus-cover.png" style="width: 175px;"></a>
										 <h3 style="margin-top: 0;">${sng.name}</h3>`

						document.getElementById("other-songs").appendChild(div)
					}
				}
			fetch(`/music/breakdown/${params.get("c")}/${params.get("s")}.song`)
				.then(r => r.arrayBuffer())
				.then(buf => {
					const stream = new KaitaiStream(buf)
					const song = new Song(stream)
					
					song.tracks.sort((a, b) => a.name.localeCompare(b.name))

					for (const s of collection.songs) {
						if (s.id == params.get("s")) {
							document.getElementById("song-name").innerHTML = s.name
							document.getElementById("song-data").innerHTML = `Created in ${formatMonthYear(s.creationMmYyyy)}<br/>
							${song.tracks.length} Tracks`
						}
					}

					//#region VST Usage in this Song
					const companyData = {}
					for (const t of song.tracks) {
						if (!companyData[t.publisher]) companyData[t.publisher] = {}
						if (!companyData[t.publisher][t.product]) companyData[t.publisher][t.product] = 0
						companyData[t.publisher][t.product]++

						const button = document.createElement("button")
						button.classList.add("track-play-option")
						button.type = "button"
						button.innerHTML = `${t.name}`
						button.id = `track-play-${t.id}`
						document.getElementById("track-play").appendChild(button)
					}

					const colors = Highcharts.getOptions().colors

					const companiesSeries = []
					const productsSeries = []
					let colorIndex = 0

					for (const [company, products] of Object.entries(companyData)) {
						const companyColor = colors[colorIndex % colors.length]
						colorIndex++

						let companyTotal = 0
						for (const count of Object.values(products)) companyTotal += count

						companiesSeries.push({
							name: company,
							y: companyTotal,
							color: companyColor
						})

						const productNames = Object.keys(products)
						productNames.forEach((product, i) => {
							const count = products[product]
							const shade = Highcharts.color(companyColor).brighten(i * 0.35 - 0.1).get()
							productsSeries.push({
								name: product,
								y: count,
								color: shade
							})
							for (const child of document.getElementById("track-play").children) {
								for (const tr1 of song.tracks) {
									if (child.id.replace("track-play-", "") == tr1.id && tr1.product == product) {
										child.style.color = `color-mix(in oklab, ${shade} 75%, var(--text-600) 25%)`
										child.buttonColorBase = shade
										child.addEventListener("mouseover", (e) => {
											e.target.style.color = `${shade}`
										})
										child.addEventListener("mouseleave", (e) => {
											e.target.style.color = `color-mix(in oklab, ${shade} 75%, var(--text-600) 25%)`
										})
										child.onclick = function() {
											for (const child1 of document.getElementById("track-play").children) {
												child1.classList.remove("active")
											}
											child.classList.add("active")
											document.getElementById("active-track-title").innerHTML = `${tr1.name}`
											document.getElementById("active-track-info").innerHTML = `Company: ${tr1.publisher}<br/>
											Product: ${tr1.product}<br/>
											Path: ${tr1.path}<br/>
											Patch: ${tr1.patch}`

											let blob
											if (tr1.compressed) {
												blob = new Blob([fflate.decompressSync(tr1.content)], { type: tr1.mimetype })
											} else {
												blob = new Blob([tr1.content], { type: tr1.mimetype });
											}
											const url = URL.createObjectURL(blob);
											const audplayer = document.getElementById("audio-track")
											audplayer.src = url
											audplayer.load()
											audplayer.classList.remove("hidden")
										}
									}
								}
							}
						})
					}

					Highcharts.chart('current-chart-cont', {
						chart: { type: 'pie' },
						title: { text: 'VST Usage in this Song' },
						series: [
							{
								name: 'Uses',
								colorByPoint: true,
								data: companiesSeries,
								size: '35%',
								dataLabels: {enabled: false}
							},
							{
								name: 'Uses',
								data: productsSeries,
								size: '70%',
								innerSize: '54%',
								dataLabels: {enabled: true}
							}
						]
					})
			})
		})
	}

	//#region VST Usage Over Time
	Highcharts.chart('chart-cont', {
		chart: {
			type: 'area'
		},
		title: {
			useHTML: true,
			text: 'VST Usage Over Time'
		},
		accessibility: {
			point: {
				valueDescriptionFormat: '{index}. {point.category}, {point.y:,' +
					'.1f}, {point.percentage:.1f}%.'
			}
		},
		yAxis: {
			labels: {
				format: '{value}%'
			},
			title: {
				enabled: false
			}
		},
		tooltip: {
			pointFormat: '<span style="color:{series.color}">{series.name}</span>' +
				': <b>{point.percentage:.1f}%</b> ({point.y:,.0f} Uses)<br/>',
			split: true
		},
		plotOptions: {
			series: {
				pointStart: "",
				label: {
					style: {
						fontSize: '1.4em',
						opacity: 0.4
					}
				}
			},
			area: {
				stacking: 'percent',
				marker: {
					enabled: false
				}
			}
		},
		series: [{
			name: 'Kontakt 8',
			data: [
				5, 10, 15
			]
		}, {
			name: "SampleTank 4",
			data: [
				0, 5, 25
			]
		}]
	})
})