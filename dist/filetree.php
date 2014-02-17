<?php
/*
# filetree parses directories server-side for FileTree.js 
# Adapted from jqueryFileTree.php by Cory S.N. LaViska
# (original copyright notice reproduced below).
#
#	This file part of:	VisiOmatic
#	Copyright:		(C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                        Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 17/02/2014

//
// jQuery File Tree PHP Connector
//
// Version 1.01
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 24 March 2008
//
// History:
//
// 1.01 - updated to work with foreign characters in directory/file names (12 April 2008)
// 1.00 - released (24 March 2008)
//
// Output a list of files for jQuery File Tree
//
*/

require './settings.php';

// Remove any .. for security reasons.
$dir = preg_replace('/\.\.\/?/', '', urldecode($_POST['dir']));
$fulldir = $filetree_rootdir . '/' . $dir;
$fitsregexp = '/.*\.fits?$/';

if (file_exists($fulldir)) {
	$files = scandir($fulldir);
	natcasesort($files);
	if (count($files) > 2) { // The 2 accounts for . and .. 
		echo "<ul class=\"filetree\" style=\"display: none;\">";
		// All dirs
		foreach ($files as $file) {
			if(file_exists($fulldir . $file) && $file != '.' && $file != '..' && is_dir($fulldir . $file)) {
				echo "<li class=\"directory collapsed\"><a href=\"#\" rel=\"" . htmlentities($dir . $file) . "/\">" . htmlentities($file) . "</a></li>";
			}
		}
		// All files
		foreach ($files as $file) {
			if(file_exists($fulldir . $file) && $file != '.' && $file != '..' && !is_dir($fulldir . $file) && preg_match($fitsregexp, $file)) {
				$ext = preg_replace('/^.*\./', '', $file);
				$fitsname = $fulldir . $file;
				$ptifname = $ptif_dir . '/' . preg_replace('/\.fits?$/', '.ptif', preg_replace('/\//', '_', $dir . $file));
				$fileclass = (file_exists($ptifname) && filemtime($ptifname) > filemtime($fitsname)) ? 'fits_ptif' : 'fits_noptif';
				echo "<li class=\"file " . $fileclass . "\"><a href=\"#\" rel=\"" . htmlentities($dir . $file) . "\"><span class=\"filename\">" . htmlentities($file) . "</span><span class=\"filesize\">&nbsp;" . floor(filesize($fitsname) / (1024*1024)) . "MB</span></a></li>";
			}
		}
		echo "</ul>";	
	}
}

?>
