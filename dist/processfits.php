<?php
/*
# processfits manages conversion from FITS to TIFF
#	This file part of:	VisiOmatic
#	Copyright:		(C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                        Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 17/02/2014
*/

require './settings.php';

$fitsname = urldecode($_POST['fitsname']);
$ptifname = preg_replace('/\.fits?$/', '.ptif', preg_replace('/\//', '_', $fitsname));
$ptiflog = preg_replace('/\.fits?$/', '.log', preg_replace('/\//', '_', $fitsname));

$fitsname =  $filetree_rootdir . '/' . $fitsname;
$ptifname =  $ptif_dir . '/' . $ptifname;
$ptiflog =  $ptif_dir . '/' . $ptiflog;

// Compute new TIFF file if TIFF file does not exists or if FITS is more recent
if (!file_exists($ptifname) or filemtime($ptifname) < filemtime($fitsname)) {
  $output = shell_exec($stiff_exec . ' ' . $stiff_opts . ' -OUTFILE_NAME ' . $ptifname . ' ' . $fitsname . ' >&' . $ptiflog);
}

printf($ptifname);
?>

