var callBookProcessingDialog = null;
var inCallbookProcessing = false;
var inCallbookItemProcessing = false;
var clicklines = [];
var map;
var maidenhead;
var geojson;
var itugeojson;
var zonemarkers = [];
var ituzonemarkers = [];
var nightlayer;

var defaultlinecolor = 'blue';

if (isDarkModeTheme()) {
	defaultlinecolor = 'red';
}

var iconsList = { 'qso': { 'color': defaultlinecolor, 'icon': 'fas fa-dot-circle', 'iconSize': [5, 5] }, 'qsoconfirm': { 'color': defaultlinecolor, 'icon': 'fas fa-dot-circle', 'iconSize': [5, 5] } };

var stationIcon = L.divIcon({ className: 'cspot_station', iconSize: [5, 5], iconAnchor: [5, 5]});
var qsoIcon = L.divIcon({ className: 'cspot_qso', iconSize: [5, 5], iconAnchor: [5, 5] }); //default (fas fa-dot-circle red)
var qsoconfirmIcon = L.divIcon({ className: 'cspot_qsoconfirm', iconSize: [5, 5], iconAnchor: [5, 5] });
var redIconImg = L.icon({ iconUrl: icon_dot_url, iconSize: [5, 5] }); // old //

$('#band').change(function () {
	var band = $("#band option:selected").text();
	if (band != "SAT") {
		$(".sats_dropdown").attr("hidden", true);
	} else {
		$(".sats_dropdown").removeAttr("hidden");
	}
});

$('#selectPropagation').change(function () {
	var prop_mode = $("#selectPropagation option:selected").text();
	if (prop_mode != "Satellite") {
		$(".sats_dropdown").attr("hidden", true);
	} else {
		$(".sats_dropdown").removeAttr("hidden");
	}
});

function updateRow(qso) {
	let row = $('#qsoID-' + qso.qsoID);
	let cells = row.find('td');
	let c = 1;
	if (user_options.datetime.show == "true"){
		cells.eq(c++).text(qso.qsoDateTime);
	}
	if (user_options.de.show == "true"){
		cells.eq(c++).text(qso.de);
	}
	if (user_options.dx.show == "true"){
		cells.eq(c++).html('<span class="qso_call"><a id="edit_qso" href="javascript:displayQso('+qso.qsoID+')"><span id="dx">'+qso.dx+'</span></a><span class="qso_icons">' + (qso.callsign == '' ? '' : ' <a href="https://lotw.arrl.org/lotwuser/act?act='+qso.callsign+'" target="_blank"><small id="lotw_info" class="badge bg-success'+qso.lotw_hint+'" data-bs-toggle="tooltip" title="LoTW User. Last upload was ' + qso.lastupload + '">L</small></a>') + ' <a target="_blank" href="https://www.qrz.com/db/'+qso.dx+'"><img width="16" height="16" src="'+base_url+ 'images/icons/qrz.png" alt="Lookup ' + qso.dx + ' on QRZ.com"></a> <a target="_blank" href="https://www.hamqth.com/'+qso.dx+'"><img width="16" height="16" src="'+base_url+ 'images/icons/hamqth.png" alt="Lookup ' + qso.dx + ' on HamQTH"></a> <a target="_blank" href="https://www.hamqth.com/'+qso.dx+'"><img width="16" height="16" src="'+base_url+ 'images/icons/hamqth.png" alt="Lookup ' + qso.dx + ' on HamQTH"></a> <a target="_blank" href="https://clublog.org/logsearch.php?log='+qso.dx+'&call='+qso.de+'"><img width="16" height="16" src="'+base_url+'images/icons/clublog.png" alt="Clublog Log Search"></a></span></span>');
	}
	if (user_options.mode.show == "true"){
		cells.eq(c++).text(qso.mode);
	}
	if (user_options.rsts.show == "true"){
		cells.eq(c++).text(qso.rstS);
	}
	if (user_options.rstr.show == "true"){
		cells.eq(c++).text(qso.rstR);
	}
	if (user_options.band.show == "true"){
		cells.eq(c++).text(qso.band);
	}
	if (user_options.myrefs.show == "true"){
		cells.eq(c++).text(qso.deRefs);
	}
	if (user_options.refs.show == "true"){
		cells.eq(c++).html(qso.dxRefs);
	}
	if (user_options.name.show == "true"){
		cells.eq(c++).text(qso.name);
	}
	if (user_options.qslvia.show == "true"){
		cells.eq(c++).text(qso.qslVia);
	}
	if (user_options.qsl.show == "true"){
		cells.eq(c++).html(qso.qsl);
	}
	if ($(".eqslconfirmation")[0] && user_options.eqsl.show == "true"){
		cells.eq(c++).html(qso.eqsl);
	}
	if ($(".lotwconfirmation")[0] && user_options.lotw.show == "true"){
		cells.eq(c++).html(qso.lotw);
	}
	if (user_options.qslmsg.show == "true"){
		cells.eq(c++).text(qso.qslMessage);
	}
	if (user_options.dxcc.show == "true"){
		cells.eq(c++).html(qso.dxcc);
	}
	if (user_options.state.show == "true"){
		cells.eq(c++).html(qso.state);
	}
	if (user_options.cqzone.show == "true"){
		cells.eq(c++).html(qso.cqzone);
	}
	if (user_options.iota.show == "true"){
		cells.eq(c++).html(qso.iota);
	}
	if (user_options.pota.show == "true"){
		cells.eq(c++).html(qso.pota);
	}
	if ( (user_options.operator) && (user_options.operator.show == "true")){
		cells.eq(c++).html(qso.operator);
	}

	$('[data-bs-toggle="tooltip"]').tooltip();
	return row;
}

function loadQSOTable(rows) {
	var uninitialized = $('#qsoList').filter(function() {
		return !$.fn.DataTable.fnIsDataTable(this);
	});

	uninitialized.each(function() {
		$.fn.dataTable.moment(custom_date_format + ' HH:mm');
		$(this).DataTable({
			searching: false,
			responsive: false,
			ordering: true,
			"scrollY": window.innerHeight - $('#searchForm').innerHeight() - 250,
			"scrollCollapse": true,
			"paging":         false,
			"scrollX": true,
			"language": {
				url: getDataTablesLanguageUrl(),
			},
			// colReorder: {
			// 	order: [0, 2,1,3,4,5,6,7,8,9,10,12,13,14,15,16,17,18]
			// 	// order: [0, customsortorder]
			//   },
		});
	});

	var table = $('#qsoList').DataTable();

	table.clear();

	for (i = 0; i < rows.length; i++) {
		let qso = rows[i];

		var data = [];
		data.push('<div class="form-check"><input class="form-check-input" type="checkbox" /></div>');
		if (user_options.datetime.show == "true"){
			data.push(qso.qsoDateTime);
		}
		if (user_options.de.show == "true"){
			data.push(qso.de);
		}
		if (user_options.dx.show == "true"){
			data.push('<span class="qso_call"><a id="edit_qso" href="javascript:displayQso('+qso.qsoID+')"><span id="dx">'+qso.dx+'</span></a><span class="qso_icons">' + (qso.callsign == '' ? '' : ' <a href="https://lotw.arrl.org/lotwuser/act?act='+qso.callsign+'" target="_blank"><small id="lotw_info" class="badge bg-success'+qso.lotw_hint+'" data-bs-toggle="tooltip" title="LoTW User. Last upload was ' + qso.lastupload + ' ">L</small></a>') + ' <a target="_blank" href="https://www.qrz.com/db/'+qso.dx+'"><img width="16" height="16" src="'+base_url+ 'images/icons/qrz.png" alt="Lookup ' + qso.dx + ' on QRZ.com"></a> <a target="_blank" href="https://www.hamqth.com/'+qso.dx+'"><img width="16" height="16" src="'+base_url+ 'images/icons/hamqth.png" alt="Lookup ' + qso.dx + ' on HamQTH"></a> <a target="_blank" href="https://clublog.org/logsearch.php?log='+qso.dx+'&call='+qso.de+'"><img width="16" height="16" src="'+base_url+'images/icons/clublog.png" alt="Clublog Log Search"></a></span></span>');
		}
		if (user_options.mode.show == "true"){
			data.push(qso.mode);
		}
		if (user_options.rsts.show == "true"){
			data.push(qso.rstS);
		}
		if (user_options.rstr.show == "true"){
			data.push(qso.rstR);
		}
		if (user_options.band.show == "true"){
			data.push(qso.band);
		}
		if (user_options.myrefs.show == "true"){
			data.push(qso.deRefs);
		}
		if (user_options.refs.show == "true"){
			data.push(qso.dxRefs);
		}
		if (user_options.name.show == "true"){
			data.push(qso.name);
		}
		if (user_options.qslvia.show == "true"){
			data.push(qso.qslVia);
		}
		if (user_options.qsl.show == "true"){
			data.push(qso.qsl);
		}
		if ($(".eqslconfirmation")[0] && user_options.eqsl.show == "true"){
			data.push(qso.eqsl);
		}
		if ($(".lotwconfirmation")[0] && user_options.lotw.show == "true"){
			data.push(qso.lotw);
		}
		if (user_options.qslmsg.show == "true"){
			data.push(qso.qslMessage);
		}
		if (user_options.dxcc.show == "true"){
			data.push(qso.dxcc+(qso.end == null ? '' : ' <span class="badge bg-danger">Deleted DXCC</span>'));
		}
		if (user_options.state.show == "true"){
			data.push(qso.state);
		}
		if (user_options.cqzone.show == "true"){
			data.push(qso.cqzone);
		}
		if (user_options.iota.show == "true"){
			data.push(qso.iota);
		}
		if (user_options.pota.show == "true"){
			data.push(qso.pota);
		}
		if (user_options.operator.show == "true"){
			data.push(qso.operator);
		}

		let createdRow = table.row.add(data).index();
		table.rows(createdRow).nodes().to$().data('qsoID', qso.qsoID);
		table.row(createdRow).node().id = 'qsoID-' + qso.qsoID;
	}
	table.draw();
	$('[data-bs-toggle="tooltip"]').tooltip();
}

function processNextCallbookItem() {
	if (!inCallbookProcessing) return;

	var elements = $('#qsoList tbody input:checked');
	var nElements = elements.length;
	if (nElements == 0) {
		inCallbookProcessing = false;
		callBookProcessingDialog.close();
		return;
	}

	callBookProcessingDialog.setMessage("Retrieving callbook data : " + nElements + " remaining");

	unselectQsoID(elements.first().closest('tr').data('qsoID'));

	$.ajax({
		url: site_url + '/logbookadvanced/updateFromCallbook',
		type: 'post',
		data: {
			qsoID: elements.first().closest('tr').data('qsoID')
		},
		dataType: 'json',
		success: function (data) {
			if (data != []) {
				updateRow(data);
			}
			setTimeout("processNextCallbookItem()", 50);
		},
		error: function (data) {
			setTimeout("processNextCallbookItem()", 50);
		},
	});
}

function selectQsoID(qsoID) {
	var element = $("#qsoID-" + qsoID);
	element.find("input[type=checkbox]").prop("checked", true);
	element.addClass('activeRow');
}

function unselectQsoID(qsoID) {
	var element = $("#qsoID-" + qsoID);
	element.find("input[type=checkbox]").prop("checked", false);
	element.removeClass('activeRow');
	$('#checkBoxAll').prop("checked", false);
}

$(document).ready(function () {

	$('#searchForm').submit(function (e) {
		var container = L.DomUtil.get('advancedmap');

		if(container != null){
			container._leaflet_id = null;
			container.remove();
			$(".coordinates").remove();
		}

		$("#qsoList").attr("Hidden", false);
		$("#qsoList_wrapper").attr("Hidden", false);
		$("#qsoList_info").attr("Hidden", false);

		$('#searchButton').prop("disabled", true).addClass("running");
		$.ajax({
			url: this.action,
			type: 'post',
			data: {
				dateFrom: this.dateFrom.value,
				dateTo: this.dateTo.value,
				de: this.de.value,
				dx: this.dx.value,
				mode: this.mode.value,
				band: this.band.value,
				qslSent: this.qslSent.value,
				qslReceived: this.qslReceived.value,
				qslSentMethod: this.qslSentMethod.value,
				qslReceivedMethod: this.qslReceivedMethod.value,
				iota: this.iota.value,
				operator: this.operator.value,
				dxcc: this.dxcc.value,
				propmode: this.selectPropagation.value,
				gridsquare: this.gridsquare.value,
				state: this.state.value,
				qsoresults: this.qsoResults.value,
				sats: this.sats.value,
				cqzone: this.cqzone.value,
				lotwSent: this.lotwSent.value,
				lotwReceived: this.lotwReceived.value,
				eqslSent: this.eqslSent.value,
				eqslReceived: this.eqslReceived.value,
				qslvia: $('[name="qslviainput"]').val(),
				sota: this.sota.value,
				pota: this.pota.value,
				wwff: this.wwff.value,
				qslimages: this.qslimages.value,
				dupes: this.dupes.value,
			},
			dataType: 'json',
			success: function (data) {
				$('#searchButton').prop("disabled", false).removeClass("running");
				loadQSOTable(data);
			},
			error: function (data) {
				$('#searchButton').prop("disabled", false).removeClass("running");
				BootstrapDialog.alert({
					title: 'ERROR',
					message: 'An error ocurred while making the request',
					type: BootstrapDialog.TYPE_DANGER,
					closable: false,
					draggable: false,
					callback: function (result) {
					}
				});
			},
		});
		return false;
	});

	$('#qsoList').on('click', 'input[type="checkbox"]', function() {
		if ($(this).is(":checked")) {
			$(this).closest('tr').addClass('activeRow');
		} else {
			$(this).closest('tr').removeClass('activeRow');
		}
	});

	$('#btnUpdateFromCallbook').click(function (event) {
		var elements = $('#qsoList tbody input:checked');
		var nElements = elements.length;
		if (nElements == 0) {
			return;
		}
		inCallbookProcessing = true;

		callBookProcessingDialog = BootstrapDialog.show({
			title: "Retrieving callbook data for " + nElements + " QSOs",
			message: "Retrieving callbook data for " + nElements + " QSOs",
			type: BootstrapDialog.TYPE_DANGER,
			closable: false,
			draggable: false,
			buttons: [{
				label: 'Cancel',
				action: function(dialog) {
					inCallbookProcessing = false;
					dialog.close();
				}
			}]
		});
		processNextCallbookItem();
	});

	$('#deleteQsos').click(function (event) {
		var elements = $('#qsoList tbody input:checked');
		var nElements = elements.length;
		if (nElements == 0) {
			return;
		}

		$('#deleteQsos').prop("disabled", true);

		var table = $('#qsoList').DataTable();

		BootstrapDialog.confirm({
			title: lang_general_word_danger,
			message: lang_filter_actions_delete_warning,
			type: BootstrapDialog.TYPE_DANGER,
			closable: true,
			draggable: true,
			btnOKClass: 'btn-danger',
			callback: function(result) {
				if(result) {
					elements.each(function() {
						let id = $(this).first().closest('tr').data('qsoID')
						$.ajax({
							url: base_url + 'index.php/qso/delete_ajax',
							type: 'post',
							data: {'id': id
							},
							success: function(data) {
								var row = $("#qsoID-" + id);
								table.row(row).remove().draw(false);
							}
						});
						$('#deleteQsos').prop("disabled", false);
					})
				}
			},
			onhide: function(dialogRef){
				$('#deleteQsos').prop("disabled", false);
			},
		});
	});

	$('#exportAdif').click(function (event) {
		var elements = $('#qsoList tbody input:checked');
		var nElements = elements.length;
		if (nElements == 0) {
			return;
		}
		$('#exportAdif').prop("disabled", true);
		var id_list=[];
		elements.each(function() {
			let id = $(this).first().closest('tr').data('qsoID')
			id_list.push(id);
			unselectQsoID(id);
		});
		xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			var a;
			if (xhttp.readyState === 4 && xhttp.status === 200) {
				// Trick for making downloadable link
				a = document.createElement('a');
				a.href = window.URL.createObjectURL(xhttp.response);
				// Give filename you wish to download
				a.download = "logbook_export.adi";
				a.style.display = 'none';
				document.body.appendChild(a);
				a.click();
			}
		};
		// Post data to URL which handles post request
		xhttp.open("POST", site_url+'/logbookadvanced/export_to_adif', true);
		xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		// You should set responseType as blob for binary responses
		xhttp.responseType = 'blob';
		xhttp.send("id=" + JSON.stringify(id_list, null, 2)+"&sortorder=" +$('.table').DataTable().order());
		$('#exportAdif').prop("disabled", false);
	});

	$('#queueBureau').click(function (event) {
		handleQsl('Q','B', 'queueBureau');
	});

	$('#queueDirect').click(function (event) {
		handleQsl('Q','D', 'queueDirect');
	});

    $('#queueElectronic').click(function (event) {
		handleQsl('Q','E', 'queueElectronic');
	});

	$('#sentBureau').click(function (event) {
		handleQsl('Y','B', 'sentBureau');
	});

	$('#sentDirect').click(function (event) {
		handleQsl('Y','D', 'sentDirect');
	});

    $('#sentElectronic').click(function (event) {
		handleQsl('Y','E', 'sentElectronic');
	});

	$('#dontSend').click(function (event) {
		handleQsl('N','', 'dontSend');
	});
	$('#notRequired').click(function (event) {
		handleQsl('I','', 'notRequired');
	});
	$('#receivedBureau').click(function (event) {
		handleQslReceived('Y','B', 'receivedBureau');
	});

	$('#receivedDirect').click(function (event) {
		handleQslReceived('Y','D', 'receivedDirect');
	});

	$('#receivedElectronic').click(function (event) {
		handleQslReceived('Y','E', 'receivedElectronic');
	});

	$('#searchGridsquare').click(function (event) {
		quickSearch('gridsquare');
	});

	$('#searchState').click(function (event) {
		quickSearch('state');
	});

	$('#searchIota').click(function (event) {
		quickSearch('iota');
	});

	$('#searchDxcc').click(function (event) {
		quickSearch('dxcc');
	});

	$('#searchCallsign').click(function (event) {
		quickSearch('dx');
	});

	$('#searchCqZone').click(function (event) {
		quickSearch('cqzone');
	});

	$('#searchMode').click(function (event) {
		quickSearch('mode');
	});

	$('#searchBand').click(function (event) {
		quickSearch('band');
	});

	$('#searchSota').click(function (event) {
		quickSearch('sota');
	});

	$('#searchWwff').click(function (event) {
		quickSearch('wwff');
	});

	$('#searchPota').click(function (event) {
		quickSearch('pota');
	});

	$('#searchOperator').click(function (event) {
		quickSearch('operator');
	});

	$('#dupeButton').click(function (event) {
		dupeSearch();
	});

	$('#optionButton').click(function (event) {
		$('#optionButton').prop("disabled", true);
		$.ajax({
			url: base_url + 'index.php/logbookadvanced/userOptions',
			type: 'post',
			success: function (html) {
				BootstrapDialog.show({
					title: 'Options for the Advanced Logbook',
					size: BootstrapDialog.SIZE_NORMAL,
					cssClass: 'options',
					nl2br: false,
					message: html,
					onshown: function(dialog) {
					},
					buttons: [{
						label: 'Save',
						cssClass: 'btn-primary btn-sm',
						id: 'saveButton',
						action: function (dialogItself) {
							$('#optionButton').prop("disabled", false);
							$('#closeButton').prop("disabled", true);
							saveOptions();
							dialogItself.close();
							location.reload();
						}
					},
					{
						label: lang_admin_close,
						cssClass: 'btn-sm',
						id: 'closeButton',
						action: function (dialogItself) {
							$('#optionButton').prop("disabled", false);
							dialogItself.close();
						}
					}],
					onhide: function(dialogRef){
						$('#optionButton').prop("disabled", false);
					},
				});
			}
		});
	});

	$('#qslSlideshow').click(function (event) {
		var elements = $('#qsoList tbody input:checked');
		var nElements = elements.length;
		if (nElements == 0) {
			return;
		}
		$('#qslSlideshow').prop("disabled", true);
		var id_list=[];
		elements.each(function() {
			let id = $(this).first().closest('tr').data('qsoID')
			id_list.push(id);
		});
		$.ajax({
			url: base_url + 'index.php/logbookadvanced/qslSlideshow',
			type: 'post',
			data: {
				ids: id_list,
			},
			success: function (html) {
				BootstrapDialog.show({
					title: 'QSL Card',
					size: BootstrapDialog.SIZE_WIDE,
					cssClass: 'lookup-dialog',
					nl2br: false,
					message: html,
					onshown: function(dialog) {

					},
					buttons: [{
						label: lang_admin_close,
						action: function (dialogItself) {
							$('#qslSlideshow').prop("disabled", false);
							dialogItself.close();
						}
					}],
					onhide: function(dialogRef){
						$('#qslSlideshow').prop("disabled", false);
					},
				});
			}
		});
	});

	function dupeSearch() {
		$("#dupes").val("Y");
		$('#dupeButton').prop('disabled', true).addClass('running');
		setTimeout(() => {
			$('#dupeButton').prop('disabled', false).removeClass("running");
		}, 1000);
		$('#searchForm').submit();
	}

	function quickSearch(type) {
		var elements = $('#qsoList tbody input:checked');
		var nElements = elements.length;
		if (nElements == 0) {
			return;
		}
		if (nElements > 1) {
			BootstrapDialog.alert({
				title: 'WARNING',
				message: 'Only 1 row can be selected for Quickfilter!',
				type: BootstrapDialog.TYPE_WARNING,
				closable: false,
				draggable: false,
				callback: function (result) {
				}
			});
		}

		elements.each(function() {
			var currentRow = $(this).first().closest('tr');
			var col1 = '';
			switch (type) {
				case 'dxcc': 		col1 = currentRow.find('#dxcc').html(); col1 = col1.match(/\d/g); col1 = col1.join(""); break;
				case 'cqzone': 		col1 = currentRow.find('#cqzone').text(); break;
				case 'iota': 		col1 = currentRow.find('#iota').text(); col1 = col1.trim(); break;
				case 'state': 		col1 = currentRow.find('#state').text(); break;
				case 'dx': 			col1 = currentRow.find('#dx').text(); col1 = col1.match(/^([^\s]+)/gm); break;
				case 'gridsquare': 	col1 = $(currentRow).find('#dxgrid').text(); col1 = col1.substring(0, 4); break;
				case 'sota': 		col1 = $(currentRow).find('#dxsota').text(); break;
				case 'wwff': 		col1 = $(currentRow).find('#dxwwff').text(); break;
				case 'pota': 		col1 = $(currentRow).find('#dxpota').text(); break;
				case 'operator': 	col1 = $(currentRow).find('#operator').text(); break;
				case 'mode': 		col1 = currentRow.find("td:eq(4)").text(); break;
				case 'band': 		col1 = currentRow.find("td:eq(7)").text(); col1 = col1.match(/\S\w*/); break;
			}
			if (col1.length == 0) return;
			$('#searchForm').trigger("reset");
			$("#"+type).val(col1);
			$('#searchForm').submit();
		});
	}

	$('#printLabel').click(function (event) {
		var elements = $('#qsoList tbody input:checked');
		var nElements = elements.length;
		if (nElements == 0) {
			return;
		}
		$('#printLabel').prop("disabled", true);

		$.ajax({
			url: base_url + 'index.php/logbookadvanced/startAtLabel',
			type: 'post',
			success: function (html) {
				BootstrapDialog.show({
					title: 'Start printing at which label?',
					size: BootstrapDialog.SIZE_NORMAL,
					cssClass: 'qso-dialog',
					nl2br: false,
					message: html,
					onshown: function(dialog) {
					},
					buttons: [{
						label: lang_admin_close,
						action: function (dialogItself) {
							$('#printLabel').prop("disabled", false);
							dialogItself.close();
						}
					}],
					onhide: function(dialogRef){
						$('#printLabel').prop("disabled", false);
					},
				});
			}
		});
	});

	$('#searchForm').on('reset', function(e) {
		$("#dupes").val("");
		setTimeout(function() {
			$('#searchForm').submit();
		});
	});

	function handleQsl(sent, method, tag) {
		var elements = $('#qsoList tbody input:checked');
		var nElements = elements.length;
		if (nElements == 0) {
			return;
		}
		$('#'+tag).prop("disabled", true);
		var id_list=[];
		elements.each(function() {
			let id = $(this).first().closest('tr').data('qsoID')
			id_list.push(id);
		});
		$.ajax({
			url: base_url + 'index.php/logbookadvanced/update_qsl',
			type: 'post',
			data: {'id': JSON.stringify(id_list, null, 2),
				'sent' : sent,
				'method' : method
			},
			success: function(data) {
				if (data != []) {
					$.each(data, function(k, v) {
						updateRow(this);
						unselectQsoID(this.qsoID);
					});
				}
				$('#'+tag).prop("disabled", false);
			}
		});
	}

	function handleQslReceived(sent, method, tag) {
		var elements = $('#qsoList tbody input:checked');
		var nElements = elements.length;
		if (nElements == 0) {
			return;
		}
		$('#'+tag).prop("disabled", true);
		var id_list=[];
		elements.each(function() {
			let id = $(this).first().closest('tr').data('qsoID')
			id_list.push(id);
		});
		$.ajax({
			url: base_url + 'index.php/logbookadvanced/update_qsl_received',
			type: 'post',
			data: {'id': JSON.stringify(id_list, null, 2),
				'sent' : sent,
				'method' : method
			},
			success: function(data) {
				if (data != []) {
					$.each(data, function(k, v) {
						updateRow(this);
						unselectQsoID(this.qsoID);
					});
				}
				$('#'+tag).prop("disabled", false);
			}
		});
	}

	$('#checkBoxAll').change(function (event) {
		if (this.checked) {
			$('#qsoList tbody tr').each(function (i) {
				selectQsoID($(this).data('qsoID'))
			});
		} else {
			$('#qsoList tbody tr').each(function (i) {
				unselectQsoID($(this).data('qsoID'))
			});
		}
	});

	$('#searchForm').submit();
});

function printlabel() {
	var id_list=[];
	var elements = $('#qsoList tbody input:checked');
	var nElements = elements.length;

	elements.each(function() {
		let id = $(this).first().closest('tr').data('qsoID')
		id_list.push(id);
	});
	$.ajax({
		url: base_url + 'index.php/labels/printids',
		type: 'post',
		data: {'id': JSON.stringify(id_list, null, 2),
				'startat': $('#startat').val(),
				'grid': $('#gridlabel')[0].checked,
				'via': $('#via')[0].checked,
			},
		xhr:function(){
			var xhr = new XMLHttpRequest();
			xhr.responseType= 'blob'
			return xhr;
		},
		success: function(data) {
			$.each(BootstrapDialog.dialogs, function(id, dialog){
				dialog.close();
			});
			if(data){
				var file = new Blob([data], {type: 'application/pdf'});
				var fileURL = URL.createObjectURL(file);
				window.open(fileURL);
			}
			$.each(id_list, function(k, v) {
				unselectQsoID(this);
			});
			$('#printLabel').prop("disabled", false);
		},
		error: function (data) {
			BootstrapDialog.alert({
				title: 'ERROR',
				message: 'Something went wrong with label print. Go to labels and check if you have defined a label, and that it is set for print!',
				type: BootstrapDialog.TYPE_DANGER,
				closable: false,
				draggable: false,
				callback: function (result) {
				}
			});
			$.each(id_list, function(k, v) {
				unselectQsoID(this);
			});
			$('#printLabel').prop("disabled", false);
		},
	});
}

function mapQsos(form) {
	$('#mapButton').prop("disabled", true).addClass("running");

	var id_list=[];
	var elements = $('#qsoList tbody input:checked');
	var nElements = elements.length;

	elements.each(function() {
		let id = $(this).first().closest('tr').data('qsoID')
		id_list.push(id);
		unselectQsoID(id);
	});

	$("#qsoList").attr("Hidden", true);
	$("#qsoList_wrapper").attr("Hidden", true);
	$("#qsoList_info").attr("Hidden", true);

	amap = $('#advancedmap').val();
	if (amap == undefined) {
		$(".qso_manager").append('<div id="advancedmap" class="map-leaflet"></div>');
	}

	if (id_list.length > 0) {
		$.ajax({
			url: base_url + 'index.php/logbookadvanced/mapSelectedQsos',
			type: 'post',
			data: {
				ids: id_list,
				de: form.de.value
			},
			success: function(data) {
				loadMapOptions(data);
			},
			error: function() {
				$('#mapButton').prop("disabled", false).removeClass("running");
			},
		});
	} else {
		$.ajax({
			url: base_url + 'index.php/logbookadvanced/mapQsos',
			type: 'post',
			data: {
				dateFrom: form.dateFrom.value,
				dateTo: form.dateTo.value,
				de: form.de.value,
				dx: form.dx.value,
				mode: form.mode.value,
				band: form.band.value,
				qslSent: form.qslSent.value,
				qslReceived: form.qslReceived.value,
				qslSentMethod: this.qslSentMethod.value,
				qslReceivedMethod: this.qslReceivedMethod.value,
				iota: form.iota.value,
				dxcc: form.dxcc.value,
				propmode: form.selectPropagation.value,
				gridsquare: form.gridsquare.value,
				state: form.state.value,
				qsoresults: form.qsoResults.value,
				sats: form.sats.value,
				cqzone: form.cqzone.value,
				lotwSent: form.lotwSent.value,
				lotwReceived: form.lotwReceived.value,
				eqslSent: form.eqslSent.value,
				eqslReceived: form.eqslReceived.value,
				qslvia: $('[name="qslviainput"]').val(),
				sota: form.sota.value,
				pota: form.pota.value,
				operator: form.operator.value,
				wwff: form.wwff.value,
				qslimages: form.qslimages.value,
			},
			success: function(data) {
				loadMapOptions(data);
			},
			error: function() {
				$('#mapButton').prop("disabled", false).removeClass("running");
			},
		});
	}
};

function loadMapOptions(data) {
	$.ajax({
		url: base_url + 'index.php/user_options/get_map_custom',
		type: 'GET',
		dataType: 'json',
	error: function () {
	},
	success: function (json_mapinfo) {
			if (typeof json_mapinfo.qso !== "undefined") {
				iconsList = json_mapinfo;
			}
			loadMap(data, iconsList)
		}
	});
}

function loadMap(data, iconsList) {
	$('#mapButton').prop("disabled", false).removeClass("running");
	var osmUrl='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var osmAttrib='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
	// If map is already initialized
	var container = L.DomUtil.get('advancedmap');

	var bounds = L.latLngBounds()

	if(container != null){
		container._leaflet_id = null;
		container.remove();
		$(".coordinates").remove();
		$(".qso_manager").append('<div id="advancedmap" class="map-leaflet"></div>');
		$(".qso_manager").append('<div class="coordinates d-flex">' +
        '<div class="cohidden">' + lang_gen_hamradio_latitude + '&nbsp;</div>' +
        '<div class="cohidden col-auto text-success fw-bold" id="latDeg"></div>' +
        '<div class="cohidden">' + lang_gen_hamradio_longitude + '&nbsp;</div>' +
        '<div class="cohidden col-auto text-success fw-bold" id="lngDeg"></div>' +
        '<div class="cohidden">' + lang_gen_hamradio_gridsquare + '&nbsp;</div>' +
        '<div class="cohidden col-auto text-success fw-bold" id="locator"></div>' +
        '<div class="cohidden">' + lang_gen_hamradio_distance + '&nbsp;</div>' +
        '<div class="cohidden col-auto text-success fw-bold" id="distance"></div>' +
        '<div class="cohidden">' + lang_gen_hamradio_bearing + '&nbsp;</div>' +
        '<div class="cohidden col-auto text-success fw-bold" id="bearing"></div>' +
		'</div>');
		$('.cohidden').show();
	}

	map = new L.Map('advancedmap', {
		fullscreenControl: true,
		fullscreenControlOptions: {
			position: 'topleft'
		},
	});

	L.tileLayer(
		osmUrl,
		{
			attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			maxZoom: 18,
			zoom: 3,
            minZoom: 2,
		}
	).addTo(map);

	map.setView([30, 0], 1.5);


	var osm = new L.TileLayer(osmUrl, {minZoom: 1, maxZoom: 9, attribution: osmAttrib});

	var redIcon = L.icon({
		iconUrl: icon_dot_url,
		iconSize: [10, 10], // size of the icon
	});

	var counter = 0;

	clicklines = [];
	$.each(data, function(k, v) {
		counter++;
		// Need to fix so that marker is placed at same place as end of line, but this only needs to be done when longitude is < -170
		if (this.latlng2[1] < -170) {
			this.latlng2[1] =  parseFloat(this.latlng2[1])+360;
		}
		if (this.latlng1[1] < -170) {
			this.latlng1[1] =  parseFloat(this.latlng1[1])+360;
		}

		var popupmessage = createContentMessage(this);
		var popupmessage2 = createContentMessageDx(this);

		var marker = L.marker([this.latlng1[0], this.latlng1[1]], {icon: stationIcon}, {closeOnClick: false, autoClose: false}).addTo(map).bindPopup(popupmessage);

		marker.on('mouseover',function(ev) {
			ev.target.openPopup();
		});
		let lat_lng = [this.latlng1[0], this.latlng1[1]];
		bounds.extend(lat_lng);

		if (this.confirmed && iconsList.qsoconfirm.icon !== "0") {
			var marker2 = L.marker([this.latlng2[0], this.latlng2[1]], {icon: qsoconfirmIcon},{closeOnClick: false, autoClose: false}).addTo(map).bindPopup(popupmessage2);
			linecolor = iconsList.qsoconfirm.color;
		} else {
			var marker2 = L.marker([this.latlng2[0], this.latlng2[1]], {icon: qsoIcon},{closeOnClick: false, autoClose: false}).addTo(map).bindPopup(popupmessage2);
			linecolor = iconsList.qso.color;
		}

		marker2.on('mouseover',function(ev) {
			ev.target.openPopup();
		});

		lat_lng = [this.latlng2[0], this.latlng2[1]];
		bounds.extend(lat_lng);

		const multiplelines = [];
		multiplelines.push(
			new L.LatLng(this.latlng1[0], this.latlng1[1]),
			new L.LatLng(this.latlng2[0], this.latlng2[1])
		)

		const geodesic = L.geodesic(multiplelines, {
			weight: 1,
			opacity: 1,
			color: linecolor,
			wrap: false,
			steps: 100
		}).addTo(map);

		clicklines.push(geodesic);
	});

	/*Legend specific*/
    var legend = L.control({ position: "topright" });

    legend.onAdd = function(map) {
        var div = L.DomUtil.create("div", "legend");
        div.innerHTML += '<div>' + counter + " QSOs plotted</div>";
		div.innerHTML += '<input id="pathlines" type="checkbox" onclick="toggleFunction(this.checked)" checked="checked" style="outline: none;"><span> Path lines</span><br>';
		div.innerHTML += '<input id="gridsquares" type="checkbox" onclick="toggleGridsquares(this.checked)" checked="checked" style="outline: none;"><span> Gridsquares</span><br>';
		div.innerHTML += '<input id="gridsquares" type="checkbox" onclick="toggleCqZones(this.checked)" style="outline: none;"><span> CQ Zones</span><br>';
		div.innerHTML += '<input id="gridsquares" type="checkbox" onclick="toggleItuZones(this.checked)" style="outline: none;"><span> ITU Zones</span><br>';
		div.innerHTML += '<input id="gridsquares" type="checkbox" onclick="toggleNightShadow(this.checked)" style="outline: none;"><span> Show night shadow</span>';
        return div;
    };

    legend.addTo(map);

	maidenhead = L.maidenheadqrb().addTo(map);


	map.fitBounds(bounds);

	$.each(iconsList, function (icon, data) {
		$('#advancedmap' + ' .cspot_' + icon).addClass(data.icon).css("color", data.color);
	});

	var printer = L.easyPrint({
		tileLayer: osm,
		sizeModes: ['Current', 'A4Landscape', 'A4Portrait'],
		filename: 'Wavelog',
		exportOnly: true,
		hideControlContainer: true
	}).addTo(map);

	map.on('mousemove', onMapMove);
}

	function createContentMessage(qso) {
		var table = '<table><tbody>' +
		'<tr>' +
		'<td>' +
		'Station callsign: ' + qso.mycallsign +
		"</td></tr>" +
		'<tr>' +
		'<td>' +
		'Gridsquare: ' + qso.mygridsquare +
		"</td></tr>";
		return (table += "</tbody></table>");
	}

	function createContentMessageDx(qso) {
		var table = '<table><tbody>' +
		'<tr>' +
		'<td>Callsign</td>' +
		'<td>' + qso.callsign + '</td>' +
		'</tr>' +
		'<tr>' +
		'<td>Date/time</td>' +
		'<td>' + qso.datetime + '</td>' +
		'</tr>' +
		'<tr>';
		if (qso.satname != "") {
			table += '<td>Band</td>' +
			'<td>' + qso.satname + '</td>' +
			'</tr>' +
			'<tr>';
		} else {
			table += '<td>Band</td>' +
			'<td>' + qso.band + '</td>' +
			'</tr>' +
			'<tr>';
		}
		table += '<td>Mode</td>' +
		'<td>' + qso.mode + '</td>' +
		'</tr>' +
		'<tr>';
		if (qso.gridsquare != undefined) {
			table += '<td>Gridsquare</td>' +
			'<td>' + qso.gridsquare + '</td>' +
			'</tr>';
		}
		if (qso.distance != undefined) {
			table += '<td>Distance</td>' +
			'<td>' + qso.distance + '</td>' +
			'</tr>';
		}
		if (qso.bearing != undefined) {
			table += '<td>Bearing</td>' +
			'<td>' + qso.bearing + '</td>' +
			'</tr>';
		}
		return (table += '</tbody></table>');
	}

	function saveOptions() {
		$('#saveButton').prop("disabled", true);
		$('#closeButton').prop("disabled", true);
		$.ajax({
			url: base_url + 'index.php/logbookadvanced/setUserOptions',
			type: 'post',
			data: {
				datetime: $('input[name="datetime"]').is(':checked') ? true : false,
				de: $('input[name="de"]').is(':checked') ? true : false,
				dx: $('input[name="dx"]').is(':checked') ? true : false,
				mode: $('input[name="mode"]').is(':checked') ? true : false,
				rsts: $('input[name="rsts"]').is(':checked') ? true : false,
				rstr: $('input[name="rstr"]').is(':checked') ? true : false,
				band: $('input[name="band"]').is(':checked') ? true : false,
				myrefs: $('input[name="myrefs"]').is(':checked') ? true : false,
				refs: $('input[name="refs"]').is(':checked') ? true : false,
				name: $('input[name="name"]').is(':checked') ? true : false,
				qslvia: $('input[name="qslvia"]').is(':checked') ? true : false,
				qsl: $('input[name="qsl"]').is(':checked') ? true : false,
				lotw: $('input[name="lotw"]').is(':checked') ? true : false,
				eqsl: $('input[name="eqsl"]').is(':checked') ? true : false,
				qslmsg: $('input[name="qslmsg"]').is(':checked') ? true : false,
				dxcc: $('input[name="dxcc"]').is(':checked') ? true : false,
				state: $('input[name="state"]').is(':checked') ? true : false,
				cqzone: $('input[name="cqzone"]').is(':checked') ? true : false,
				iota: $('input[name="iota"]').is(':checked') ? true : false,
				pota: $('input[name="pota"]').is(':checked') ? true : false,
				operator: $('input[name="operator"]').is(':checked') ? true : false,
			},
			success: function(data) {
				$('#saveButton').prop("disabled", false);
				$('#closeButton').prop("disabled", false);
			},
			error: function() {
				$('#saveButton').prop("disabled", false);
			},
		});
	}

	function toggleFunction(bool) {
		if(bool) {
			addLines();
		} else {
			clearLines();
		}
	};

	function toggleGridsquares(bool) {
		if(!bool) {
			map.removeLayer(maidenhead);
		} else {
			maidenhead.addTo(map);
		}
	};

	const cqzonenames = [
		[ "75", "-140" ],
		[ "70", "-82.5" ],
		[ "45", "-125" ],
		[ "45", "-100" ],
		[ "45", "-65" ],
		[ "25.5", "-115" ],
		[ "14.5", "-90" ],
		[ "22", "-60" ],
		[ "11.5", "-70" ],
		[ "-5", "-100" ],
		[ "-9", "-45" ],
		[ "-45", "-106" ],
		[ "-45", "-55" ],
		[ "52", "-14" ],
		[ "46", "11" ],
		[ "60", "35" ],
		[ "55", "65" ],
		[ "70", "90" ],
		[ "70", "150" ],
		[ "42", "29" ],
		[ "28", "53" ],
		[ "6", "75" ],
		[ "44", "93" ],
		[ "33", "110" ],
		[ "38", "134" ],
		[ "16", "100" ],
		[ "15", "140" ],
		[ "0", "125" ],
		[ "-25", "115" ],
		[ "-25", "145" ],
		[ "15", "-165" ],
		[ "-25", "-165" ],
		[ "32", "-26" ],
		[ "25", "25.5" ],
		[ "15", "-6" ],
		[ "-5", "-6" ],
		[ "6", "51" ],
		[ "-45", "8" ],
		[ "-25", "55"],
		[  "78", "-10"],
	];

	const ituzonenames = [
		["60","-160"],
		["55","-125"],
		["55","-100"],
		["55","-78"],
		["73","-40"],
		["40","-119"],
		["40","-100"],
		["40","-80"],
		["55","-60"],
		["20","-102"],
		["21","-75"],
		["-3","-72"],
		["-5","-45"],
		["-30","-65"],
		["-25","-45"],
		["-50","-65"],
		["61","-26"],
		["70","10"],
		["70","40"],
		["70","62.5"],
		["70","82.5"],
		["70","100"],
		["70","122.5"],
		["70","142.5"],
		["70","162.5"],
		["70","180"],
		["52","2"],
		["45","18"],
		["53","36"],
		["53","62.5"],
		["53","82.5"],
		["53","100"],
		["53","122.5"],
		["53","142"],
		["55","160"],
		["35","-25"],
		["35","0"],
		["27.5","22.5"],
		["27","42"],
		["32","56"],
		["10","75"],
		["39","82.5"],
		["33","100"],
		["33","118"],
		["33","140"],
		["15","-10"],
		["12.5","22"],
		["5","40"],
		["15","100"],
		["10","120"],
		["-4","150"],
		["-7","17"],
		["-12.5","45"],
		["-2","115"],
		["-20","140"],
		["-20","170"],
		["-30","24"],
		["-25","120"],
		["-40","140"],
		["-40","170"],
		["15","-170"],
		["-15","-170"],
		["-15","-135"],
		["10","140"],
		["10","162"],
		["-23","-11"],
		["-70","10"],
		["-47.5","60"],
		["-70","70"],
		["-70","130"],
		["-70","-170"],
		["-70","-110"],
		["-70","-050"],
		["-82.5","0"],
		["82.5","0"],
		["40","-150"],
		["15","-135"],
		["-15","-95"],
		["-40","-160"],
		["-40","-125"],
		["-40","-90"],
		["50","-30"],
		["25","-47.5"],
		["-45","-40"],
		["-45","10"],
		["-25","70"],
		["-25","95"],
		["-50","95"],
		["-54","140"],
		["39","165"]
	];

	function toggleCqZones(bool) {
		if(!bool) {
			zonemarkers.forEach(function (item) {
				map.removeLayer(item);
			});
			map.removeLayer(geojson);
		} else {
			geojson = L.geoJson(zonestuff, {style: style}).addTo(map);
			for (var i = 0; i < cqzonenames.length; i++) {

				var title = '<span class="grid-text" style="cursor: default"><font style="color: \'white\'; font-size: 1.5em; font-weight: 900;">' + (Number(i)+Number(1)) + '</font></span>';
				var myIcon = L.divIcon({className: 'my-div-icon', html: title});

				var marker = L.marker(
					[cqzonenames[i][0], cqzonenames[i][1]], {
						icon: myIcon,
						title: (Number(i)+Number(1)),
						zIndex: 1000,
					}
				).addTo(map);
				zonemarkers.push(marker);
			}
		}
	}

	function toggleItuZones(bool) {
		if(!bool) {
			ituzonemarkers.forEach(function (item) {
				map.removeLayer(item);
			});
			map.removeLayer(itugeojson);
		} else {
			itugeojson = L.geoJson(ituzonestuff, {style: style}).addTo(map);
			for (var i = 0; i < ituzonenames.length; i++) {

				var title = '<span class="grid-text" style="cursor: default"><font style="color: \'white\'; font-size: 1.5em; font-weight: 900;">' + (Number(i)+Number(1)) + '</font></span>';
				var myIcon = L.divIcon({className: 'my-div-icon', html: title});

				var marker = L.marker(
					[ituzonenames[i][0], ituzonenames[i][1]], {
						icon: myIcon,
						title: (Number(i)+Number(1)),
						zIndex: 1000,
					}
				).addTo(map);
				ituzonemarkers.push(marker);
			}
		}
	}

	function toggleNightShadow(bool) {
		if(!bool) {
			map.removeLayer(nightlayer);
		} else {
			nightlayer = L.terminator().addTo(map);
		}
	}

	function style(feature) {
		var bordercolor = "black";
		if (isDarkModeTheme()) {
            bordercolor = "white";
        }
		return {
			fillColor: "white",
			fillOpacity: 0,
			opacity: 0.65,
			color: bordercolor,
			weight: 1,
		};
	}

	function clearLines() {
		clicklines.forEach(function (item) {
			map.removeLayer(item);
		});
	}

	function addLines() {
		clicklines.forEach(function (item) {
			map.addLayer(item);
		});
	}
