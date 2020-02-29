<?php 
    header("Access-Control-Allow-Origin: *");
    require('fpdf/fpdf.php');
?>
<?php 
    $data = $_POST['data_json'];
    $parsed_data = json_decode($data); 
    $name = $parsed_data->name;
    $dob = $parsed_data->dob;
    $gender = $parsed_data->gender;
    $email = $parsed_data->email;
    $phone = $parsed_data->phone;
    $symptoms = $parsed_data->symptoms;
    $diagnoses = $parsed_data->diagnoses;
    $medicine = $parsed_data->medicine;
    $pdf = new FPDF();
    $pdf->AddPage();
    $pdf->SetFont('Arial','I',20);
    $pdf->Text(5,30,"Patient's Information");
    $pdf->Ln();
    $pdf->SetFont('Arial','I',16);
    $pdf->Text(5,40,$name);
    $pdf->Ln();
    $pdf->SetFont('Arial','',14);
    $pdf->Text(5,45,$dob);
    $pdf->Ln();
    $pdf->Text(5,50,$gender);
    $pdf->Ln();
    $pdf->Text(5,55,$email);
    $pdf->Ln();
    $pdf->Text(5,60,$phone);
    $pdf->Ln();
    $qrData = $parsed_data->url;
    $pdf->Image($qrData,175,5,30,0,'PNG');
    $pdf->SetFont('Arial','I',20);
    $pdf->Text(5,70,"Symptoms");
    $pdf->Ln();
    $ht = 80;
    $pdf->SetFont('Arial','I',14);
    foreach($symptoms as $value)
    {
      $pdf->Text(5,$ht,$value);
      $ht = $ht + 10;
    }
    $pdf->SetFont('Arial','I',20);
    $pdf->Text(5,$ht,"Diagnoses");
    $pdf->Ln();
    $ht = $ht +10;
    $pdf->SetFont('Arial','I',14);
    foreach($diagnoses as $value)
    {
      $pdf->Text(5,$ht,$value);
      $ht = $ht + 10;
    }
    $pdf->SetFont('Arial','I',20);
    $pdf->Text(5,$ht,"Medicines");
    $pdf->Ln();
    $ht = $ht +10;
    $pdf->SetFont('Arial','I',14);
    for($i=0;$i<count($medicine);$i++)
    {
        $pdf->SetXY(5,$ht);
        $pdf->Cell(0,20,$medicine[$i]->name ." ".$medicine[$i]->interval." ".$medicine[$i]->bfaf." ".$medicine[$i]->duration);
        $ht = $ht +10;
    }
    $filename = "prescription/".$_POST['presID'];
    $pdf->Output($filename.".pdf",'F');
?>