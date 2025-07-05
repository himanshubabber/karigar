const occupations = [
  {
    title: 'Plumber',
    image: 'https://5.imimg.com/data5/SELLER/Default/2023/4/301270031/RO/MJ/HW/55834732/plumber-service.jpg',
  },
  {
    title: 'Electrician',
    image: 'https://content.jdmagicbox.com/v2/comp/delhi/n9/011pxx11.xx11.191011134917.y1n9/catalogue/amar-electrician-dori-walan-delhi-electricians-for-commercial-1nldjoqe5s.jpg',
  },
  {
    title: 'Carpenter',
    image: 'https://mccoymart.com/post/wp-content/uploads/The-Top-10-Benefits-Of-Hiring-A-Professional-Carpenter.jpg',
  }
  ,
  {
    title: 'Painter',
    image: 'https://alis.alberta.ca/media/697574/painter-and-decorator-istock-174536787.jpg',
  },
  {
    title: 'AC Repair',
    image: 'https://3.imimg.com/data3/BH/SR/MY-8941393/split-ac-service-500x500.jpg',
  },
  {
    title: 'Washing Machine',
    image: 'https://clareservices.com/wp-content/uploads/2023/02/washing-machine-service-in-delhi.jpg',
  },
];

const Occupations = () => {
  return (
    <div className="container my-5">
      <h2 className="text-center mb-4 fw-bold">Our Services</h2>
      <div className="row g-4 justify-content-center">
        {occupations.map((occ, i) => (
          <div className="col-6 col-md-4 col-lg-3" key={i}>
            <div className="card h-100 shadow-sm">
              <img
                src={occ.image}
                className="card-img-top"
                alt={occ.title}
                style={{ height: '180px', objectFit: 'cover' }}
              />
              <div className="card-body text-center">
                <h5 className="card-title">{occ.title}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Occupations;
