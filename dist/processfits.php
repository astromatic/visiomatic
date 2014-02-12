<?php
$output=shell_exec("/usr/local/libexec/fitstotiff.py ".$_GET["fitsfilename"]." 2>&1");
echo "<pre>$output</pre>";
echo "Done";
?>

